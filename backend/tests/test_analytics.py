def test_spend_by_category(client, sample_data):
    response = client.get("/api/v1/analytics/spend-by-category")
    assert response.status_code == 200
    data = response.json()
    assert "categories" in data
    assert len(data["categories"]) == 2  # Shopping & Food & Dining (Uber failed)
    # Total spend = 2500 + 750 + 15000 = 18250
    assert data["total_spend"] == 18250.00
    
    # Check Shopping total (17500)
    shopping = next(c for c in data["categories"] if c["category"] == "Shopping")
    assert shopping["total_amount"] == 17500.00
    assert shopping["transaction_count"] == 2


def test_monthly_trend(client, sample_data):
    response = client.get("/api/v1/analytics/monthly-trend")
    assert response.status_code == 200
    data = response.json()
    assert "months" in data
    assert len(data["months"]) >= 1


def test_overview_metrics(client, sample_data):
    response = client.get("/api/v1/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["total_spend"] == 18250.00
    assert data["total_transactions"] == 3
    assert data["top_category"] == "Shopping"
    assert data["top_merchant"] == "Amazon"
