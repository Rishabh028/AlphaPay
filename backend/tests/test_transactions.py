def test_list_transactions_basic(client, sample_data):
    response = client.get("/api/v1/transactions")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] == 4
    assert len(data["items"]) == 4
    assert "stats" in data
    assert data["stats"]["success_count"] == 3
    assert data["stats"]["failed_count"] == 1


def test_filter_by_merchant_search(client, sample_data):
    response = client.get("/api/v1/transactions?search=Amazon")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    for item in data["items"]:
        assert "Amazon" in item["merchant"]


def test_filter_by_category(client, sample_data):
    response = client.get("/api/v1/transactions?category=Food %26 Dining")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["merchant"] == "Swiggy"


def test_filter_by_status(client, sample_data):
    response = client.get("/api/v1/transactions?status=FAILED")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["status"] == "FAILED"


def test_filter_by_amount_range(client, sample_data):
    response = client.get("/api/v1/transactions?min_amount=1000&max_amount=5000")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["amount"] == 2500.00


def test_combinable_filters(client, sample_data):
    # Category = Shopping, Status = SUCCESS, min_amount = 5000
    response = client.get("/api/v1/transactions?category=Shopping&status=SUCCESS&min_amount=5000")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["amount"] == 15000.00


def test_sort_transactions(client, sample_data):
    # Sort by amount asc
    response = client.get("/api/v1/transactions?sort_by=amount&sort_order=asc")
    assert response.status_code == 200
    items = response.json()["items"]
    assert items[0]["amount"] == 400.00
    assert items[-1]["amount"] == 15000.00


def test_get_single_transaction_detail(client, sample_data):
    response = client.get("/api/v1/transactions/t-1")
    assert response.status_code == 200
    item = response.json()
    assert item["id"] == "t-1"
    assert item["raw_id"] == "TXN1001"
    assert item["merchant"] == "Amazon"
    assert item["coins_earned"] == 25


def test_get_nonexistent_transaction(client, sample_data):
    response = client.get("/api/v1/transactions/nonexistent-id-999")
    assert response.status_code == 404
