def test_get_coin_balance(client, sample_data):
    # Total coins earned = 25 (t1) + 7 (t2) + 0 (t3) + 100 (t4) = 132 coins
    response = client.get("/api/v1/rewards/balance")
    assert response.status_code == 200
    data = response.json()
    assert data["total_earned_coins"] == 132
    assert data["total_redeemed_coins"] == 0
    assert data["available_balance"] == 132


def test_get_rewards_catalogue(client, sample_data):
    response = client.get("/api/v1/rewards/catalogue")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 2
    assert items[0]["id"] == "rew_swiggy_250"
    assert items[0]["cost_coins"] == 25


def test_successful_reward_redemption(client, sample_data):
    # Redeem Swiggy voucher for 25 coins
    response = client.post("/api/v1/rewards/redeem", json={"reward_id": "rew_swiggy_250"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["coins_spent"] == 25
    assert data["remaining_balance"] == 132 - 25  # 107 coins
    assert "voucher_code" in data
    assert data["voucher_code"].startswith("SWIG-")

    # Verify balance updated in balance endpoint
    bal_res = client.get("/api/v1/rewards/balance")
    assert bal_res.json()["available_balance"] == 107
    assert bal_res.json()["total_redeemed_coins"] == 25


def test_insufficient_balance_redemption(client, sample_data):
    # Try to redeem 99999 coins when balance is ~132
    response = client.post("/api/v1/rewards/redeem", json={"reward_id": "rew_expensive_9999"})
    assert response.status_code == 400
    assert "Insufficient coins" in response.json()["detail"]


def test_nonexistent_reward_redemption(client, sample_data):
    response = client.post("/api/v1/rewards/redeem", json={"reward_id": "fake_reward_999"})
    assert response.status_code == 404
    assert "does not exist" in response.json()["detail"]


def test_redemption_history(client, sample_data):
    # Redeem one
    client.post("/api/v1/rewards/redeem", json={"reward_id": "rew_swiggy_250"})
    
    # Check history
    response = client.get("/api/v1/rewards/history")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert data["redemptions"][0]["reward_id"] == "rew_swiggy_250"
