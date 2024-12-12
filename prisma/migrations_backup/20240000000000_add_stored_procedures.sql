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
    -- Get current stock price
    SELECT price INTO v_price
    FROM "StockPrice"
    WHERE "companyId" = p_stock_id
    ORDER BY timestamp DESC
    LIMIT 1;
    
    -- Calculate total cost
    v_total_cost := v_price * p_quantity;
    
    -- Get user's balance
    SELECT balance INTO v_user_balance
    FROM "User"
    WHERE id = p_user_id
    FOR UPDATE;
    
    IF v_user_balance >= v_total_cost THEN
        -- Update user's balance
        UPDATE "User"
        SET balance = balance - v_total_cost
        WHERE id = p_user_id;
        
        -- Create transaction record
        INSERT INTO "Transaction" (id, "userId", "companyId", quantity, price, type, total, "createdAt")
        VALUES (gen_random_uuid(), p_user_id, p_stock_id, p_quantity, v_price, 'BUY', v_total_cost, NOW());
        
        -- Ensure portfolio exists
        INSERT INTO "Portfolio" (id, "userId", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), p_user_id, NOW(), NOW())
        ON CONFLICT ("userId") DO NOTHING
        RETURNING id INTO v_portfolio_id;
        
        -- If portfolio already existed, get its ID
        IF v_portfolio_id IS NULL THEN
            SELECT id INTO v_portfolio_id
            FROM "Portfolio"
            WHERE "userId" = p_user_id;
        END IF;
        
        -- Update or create stock position
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