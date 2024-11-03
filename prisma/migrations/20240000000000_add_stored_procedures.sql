SET FOREIGN_KEY_CHECKS=0;
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = utf8mb4_unicode_ci;

DROP PROCEDURE IF EXISTS BuyStock;

DELIMITER //

CREATE PROCEDURE BuyStock(
    IN p_userId VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_stockId VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    IN p_quantity INT
)
BEGIN
    DECLARE v_price DECIMAL(10,2);
    DECLARE v_total_cost DECIMAL(10,2);
    DECLARE v_user_balance DECIMAL(10,2);
    
    START TRANSACTION;
    
    -- get the current stock price
    SELECT price INTO v_price
    FROM StockPrice
    WHERE companyId = p_stockId COLLATE utf8mb4_unicode_ci
    ORDER BY timestamp DESC
    LIMIT 1;
    
    -- calculate total cost
    SET v_total_cost = v_price * p_quantity;
    
    -- get users balance
    SELECT balance INTO v_user_balance
    FROM User
    WHERE id = p_userId COLLATE utf8mb4_unicode_ci
    FOR UPDATE;
    
    -- check if user has enough balance
    IF v_user_balance >= v_total_cost THEN
        -- update user's balance
        UPDATE User
        SET balance = balance - v_total_cost
        WHERE id = p_userId COLLATE utf8mb4_unicode_ci;
        
        -- create record of transaction
        INSERT INTO Transaction (id, userId, companyId, quantity, price, type, total, createdAt)
        VALUES (UUID(), p_userId, p_stockId, p_quantity, v_price, 'BUY', v_total_cost, NOW());
        
        -- ensure portfolio exists
        INSERT IGNORE INTO Portfolio (id, userId, createdAt, updatedAt)
        VALUES (UUID(), p_userId, NOW(), NOW());
        
        -- update or create portfolio entry
        INSERT INTO Stock (id, portfolioId, companyId, quantity, createdAt, updatedAt)
        SELECT UUID(), p.id, p_stockId, p_quantity, NOW(), NOW()
        FROM Portfolio p
        WHERE p.userId = p_userId COLLATE utf8mb4_unicode_ci
        ON DUPLICATE KEY UPDATE
        quantity = quantity + VALUES(quantity),
        updatedAt = NOW();
        
        COMMIT;
    ELSE
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Insufficient balance';
    END IF;
END //

DELIMITER ;

SET FOREIGN_KEY_CHECKS=1;