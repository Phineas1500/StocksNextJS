DROP PROCEDURE IF EXISTS SellStock;

DELIMITER //

CREATE PROCEDURE SellStock(
    IN p_userId VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_stockId VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_quantity INT
)
BEGIN
    DECLARE v_price DECIMAL(10,2);
    DECLARE v_total_value DECIMAL(10,2);
    DECLARE v_current_quantity INT;
    DECLARE v_portfolio_id VARCHAR(191);
    
    START TRANSACTION;
    
    -- get the current stock price
    SELECT price INTO v_price
    FROM StockPrice
    WHERE companyId = p_stockId COLLATE utf8mb4_unicode_ci
    ORDER BY timestamp DESC
    LIMIT 1;
    
    -- calculate total value
    SET v_total_value = v_price * p_quantity;

    -- get current quantity owned
    SELECT s.quantity, s.portfolioId INTO v_current_quantity, v_portfolio_id
    FROM Portfolio p
    JOIN Stock s ON p.id = s.portfolioId
    WHERE p.userId = p_userId COLLATE utf8mb4_unicode_ci
    AND s.companyId = p_stockId COLLATE utf8mb4_unicode_ci
    FOR UPDATE;
    
    -- check if user has enough stocks
    IF v_current_quantity >= p_quantity THEN
        -- update user's balance
        UPDATE User
        SET balance = balance + v_total_value
        WHERE id = p_userId COLLATE utf8mb4_unicode_ci;
        
        -- create record of transaction
        INSERT INTO Transaction (id, userId, companyId, quantity, price, type, total, createdAt)
        VALUES (UUID(), p_userId, p_stockId, p_quantity, v_price, 'SELL', v_total_value, NOW());
        
        -- update stock quantity
        UPDATE Stock
        SET quantity = quantity - p_quantity,
            updatedAt = NOW()
        WHERE portfolioId = v_portfolio_id
        AND companyId = p_stockId COLLATE utf8mb4_unicode_ci;
        
        -- delete stock entry if quantity becomes 0
        DELETE FROM Stock 
        WHERE portfolioId = v_portfolio_id 
        AND companyId = p_stockId COLLATE utf8mb4_unicode_ci
        AND quantity = 0;
        
        COMMIT;
    ELSE
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Insufficient stock quantity';
    END IF;
END //