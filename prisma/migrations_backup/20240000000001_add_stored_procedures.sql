-- Sell Stock Function
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
    -- Get current stock price
    SELECT price INTO v_price
    FROM "StockPrice"
    WHERE "companyId" = p_stock_id
    ORDER BY timestamp DESC
    LIMIT 1;
    
    -- Calculate total value
    v_total_value := v_price * p_quantity;
    
    -- Get current quantity owned
    SELECT s.quantity, p.id INTO v_current_quantity, v_portfolio_id
    FROM "Portfolio" p
    JOIN "Stock" s ON p.id = s."portfolioId"
    WHERE p."userId" = p_user_id
    AND s."companyId" = p_stock_id
    FOR UPDATE;
    
    IF v_current_quantity >= p_quantity THEN
        -- Update user's balance
        UPDATE "User"
        SET balance = balance + v_total_value
        WHERE id = p_user_id;
        
        -- Create transaction record
        INSERT INTO "Transaction" (id, "userId", "companyId", quantity, price, type, total, "createdAt")
        VALUES (gen_random_uuid(), p_user_id, p_stock_id, p_quantity, v_price, 'SELL', v_total_value, NOW());
        
        -- Update stock quantity
        UPDATE "Stock"
        SET quantity = quantity - p_quantity,
            "updatedAt" = NOW()
        WHERE "portfolioId" = v_portfolio_id
        AND "companyId" = p_stock_id;
        
        -- Delete stock entry if quantity becomes 0
        DELETE FROM "Stock"
        WHERE "portfolioId" = v_portfolio_id
        AND "companyId" = p_stock_id
        AND quantity <= 0;
    ELSE
        RAISE EXCEPTION 'Insufficient stock quantity';
    END IF;
END;
$$ LANGUAGE plpgsql;