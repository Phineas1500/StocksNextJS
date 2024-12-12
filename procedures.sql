-- Buy Stock Function
CREATE OR REPLACE FUNCTION buy_stock(
    p_user_id TEXT,
    p_stock_id TEXT,
    p_quantity INTEGER
)
RETURNS VOID AS $$
DECLARE
    v_price DECIMAL;
    v_total_cost DECIMAL;
    v_user_balance DECIMAL;
    v_portfolio_id TEXT;
BEGIN
    -- get current stock price
    SELECT price INTO v_price
    FROM "StockPrice"
    WHERE "companyId" = p_stock_id
    ORDER BY timestamp DESC
    LIMIT 1;
    
    -- calculate total cost
    v_total_cost := v_price * p_quantity;
    
    -- get user balance
    SELECT balance INTO v_user_balance
    FROM "User"
    WHERE id = p_user_id
    FOR UPDATE;
    
    IF v_user_balance >= v_total_cost THEN
        -- update user balance
        UPDATE "User"
        SET balance = balance - v_total_cost
        WHERE id = p_user_id;
        
        -- create transaction record
        INSERT INTO "Transaction" (id, "userId", "companyId", quantity, price, type, total, "createdAt")
        VALUES (gen_random_uuid(), p_user_id, p_stock_id, p_quantity, v_price, 'BUY', v_total_cost, NOW());
        
        -- make sure portfoio exists
        INSERT INTO "Portfolio" (id, "userId", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), p_user_id, NOW(), NOW())
        ON CONFLICT ("userId") DO NOTHING
        RETURNING id INTO v_portfolio_id;
        
        -- if exists, get ID
        IF v_portfolio_id IS NULL THEN
            SELECT id INTO v_portfolio_id
            FROM "Portfolio"
            WHERE "userId" = p_user_id;
        END IF;
        
        -- update or create stock position
        INSERT INTO "Stock" (id, "portfolioId", "companyId", quantity, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), v_portfolio_id, p_stock_id, p_quantity, NOW(), NOW())
        ON CONFLICT ("portfolioId", "companyId") DO UPDATE
        SET quantity = "Stock".quantity + EXCLUDED.quantity,
            "updatedAt" = NOW();
    ELSE
        RAISE EXCEPTION 'Insufficient balance';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- sell Stock Function
CREATE OR REPLACE FUNCTION sell_stock(
    p_user_id TEXT,
    p_stock_id TEXT,
    p_quantity INTEGER
)
RETURNS VOID AS $$
DECLARE
    v_price DECIMAL;
    v_total_value DECIMAL;
    v_current_quantity INTEGER;
    v_portfolio_id TEXT;
BEGIN
    -- get current stock price
    SELECT price INTO v_price
    FROM "StockPrice"
    WHERE "companyId" = p_stock_id
    ORDER BY timestamp DESC
    LIMIT 1;
    
    -- calculate total value
    v_total_value := v_price * p_quantity;
    
    -- get current quantity owned
    SELECT s.quantity, p.id INTO v_current_quantity, v_portfolio_id
    FROM "Portfolio" p
    JOIN "Stock" s ON p.id = s."portfolioId"
    WHERE p."userId" = p_user_id
    AND s."companyId" = p_stock_id
    FOR UPDATE;
    
    IF v_current_quantity >= p_quantity THEN
        -- update user balance
        UPDATE "User"
        SET balance = balance + v_total_value
        WHERE id = p_user_id;
        
        -- create transaction record
        INSERT INTO "Transaction" (id, "userId", "companyId", quantity, price, type, total, "createdAt")
        VALUES (gen_random_uuid(), p_user_id, p_stock_id, p_quantity, v_price, 'SELL', v_total_value, NOW());
        
        -- update stock quantity
        UPDATE "Stock"
        SET quantity = quantity - p_quantity,
            "updatedAt" = NOW()
        WHERE "portfolioId" = v_portfolio_id
        AND "companyId" = p_stock_id;
        
        -- delete stock entry if quantity becomes 0
        DELETE FROM "Stock"
        WHERE "portfolioId" = v_portfolio_id
        AND "companyId" = p_stock_id
        AND quantity <= 0;
    ELSE
        RAISE EXCEPTION 'Insufficient stock quantity';
    END IF;
END;
$$ LANGUAGE plpgsql;