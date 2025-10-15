from flask import Flask, jsonify, request
import json, datetime, os

app = Flask(__name__)
DATA_DIR = "data"

# ---------- Utility Functions ----------
def load_json(filename):
    with open(os.path.join(DATA_DIR, filename), "r") as f:
        return json.load(f)

def save_json(filename, data):
    with open(os.path.join(DATA_DIR, filename), "w") as f:
        json.dump(data, f, indent=4)

# ---------- Employees ----------
@app.route("/api/employees")
def get_employees():
    return jsonify(load_json("employees.json"))

# ---------- Attendance ----------
@app.route("/api/attendance", methods=["GET","POST"])
def attendance():
    employees = load_json("employees.json")
    today = datetime.date.today().strftime("%Y-%m-%d")

    if request.method=="POST":
        emp_id = int(request.json["id"])
        for emp in employees:
            if emp["id"] == emp_id:
                # Add attendance if not already present
                if not any(a["date"]==today for a in emp["attendance"]):
                    now = datetime.datetime.now().strftime("%H:%M:%S")
                    emp["attendance"].append({"date":today,"time":now})
                    save_json("employees.json", employees)
                    return jsonify({"status":"ok"})
        return jsonify({"status":"already_present"})

    # GET today's attendance summary
    count = sum(1 for emp in employees if any(a["date"]==today for a in emp["attendance"]))
    return jsonify({"present":count})

# ---------- Raw Materials ----------
@app.route("/api/raw_materials")
def raw_materials():
    return jsonify(load_json("raw_materials.json"))

# ---------- Productivity / Daily Products ----------
@app.route("/api/daily_products", methods=["GET","POST"])
def daily_products():
    daily = load_json("daily_products.json")
    today = datetime.date.today().strftime("%Y-%m-%d")

    if request.method=="POST":
        dept = request.json["department"]
        day_shift = request.json.get("day_shift",0)
        night_shift = request.json.get("night_shift",0)
        if today not in daily:
            daily[today] = []
        daily[today].append({"department":dept,"day_shift":day_shift,"night_shift":night_shift})
        save_json("daily_products.json", daily)
        return jsonify({"status":"ok"})

    return jsonify(daily.get(today,[]))

# ---------- Total Products ----------
@app.route("/api/total_products", methods=["GET"])
def total_products():
    return jsonify(load_json("total_products.json"))

# ---------- Departments / Manpower ----------
@app.route("/api/departments")
def departments():
    return jsonify(load_json("departments.json"))

# ---------- Daily Report ----------
@app.route("/api/daily_report")
def daily_report():
    employees = load_json("employees.json")
    daily = load_json("daily_products.json")
    today = datetime.date.today().strftime("%Y-%m-%d")

    attendance_count = sum(1 for emp in employees if any(a["date"]==today for a in emp["attendance"]))
    products_today = daily.get(today,[])
    report = {"date":today,"attendance":attendance_count,"daily_products":products_today}
    return jsonify(report)

if __name__=="__main__":
    os.makedirs(DATA_DIR, exist_ok=True)
    app.run(debug=True, port=5000)
