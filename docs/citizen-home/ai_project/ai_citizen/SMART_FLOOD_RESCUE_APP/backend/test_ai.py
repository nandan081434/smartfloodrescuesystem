from ai_engine import ai_decision

while True:
    q = input("USER: ")
    if q.lower() == "exit":
        break

    res = ai_decision(q)
    print("INTENT:", res["intent"])
    print("RISK:", res["risk_level"])
    for m in res["messages"]:
        print("-", m)
    print("RESCUE REQUIRED:", res["rescue_required"])
    print()
