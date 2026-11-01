#include <iostream>
#include <string>
#include <vector>
#include <sstream>

#include "crow_all.h"

using namespace std;


class Vehicle
{
public:

    string vehicleNo;
    string type;
    int slot;

    Vehicle(string number, string vehicleType, int parkingSlot)
    {
        vehicleNo = number;
        type = vehicleType;
        slot = parkingSlot;
    }
};


class ParkingSystem
{
private:

    vector<Vehicle> vehicles;

    int totalSlots = 10;

    int findAvailableSlot()
    {
        for (int i = 1; i <= totalSlots; i++)
        {
            bool occupied = false;

            for (auto &v : vehicles)
            {
                if (v.slot == i)
                {
                    occupied = true;
                    break;
                }
            }

            if (!occupied)
                return i;
        }

        return -1;
    }


public:

    bool parkVehicle(string vehicleNo, string type, int &slot)
    {

        // Duplicate check
        for (auto &v : vehicles)
        {
            if (v.vehicleNo == vehicleNo)
            {
                return false;
            }
        }


        slot = findAvailableSlot();


        if (slot == -1)
        {
            return false;
        }


        vehicles.push_back(
            Vehicle(vehicleNo, type, slot)
        );


        return true;
    }


    bool removeVehicle(string vehicleNo, int hours, int &fee)
    {

        for (auto it = vehicles.begin();
             it != vehicles.end();
             ++it)
        {

            if (it->vehicleNo == vehicleNo)
            {

                /*
                    Parking rate:
                    ₹20 per hour
                */

                fee = hours * 20;

                vehicles.erase(it);

                return true;
            }
        }


        return false;
    }


    bool searchVehicle(
        string vehicleNo,
        Vehicle &result
    )
    {

        for (auto &v : vehicles)
        {

            if (v.vehicleNo == vehicleNo)
            {
                result = v;

                return true;
            }
        }

        return false;
    }


    crow::json::wvalue getSlots()
    {

        crow::json::wvalue result;

        for (int i = 1; i <= totalSlots; i++)
        {

            bool occupied = false;

            for (auto &v : vehicles)
            {

                if (v.slot == i)
                {
                    occupied = true;
                    break;
                }
            }


            result[i - 1]["slot"] = i;


            if (occupied)
            {
                result[i - 1]["status"] =
                    "occupied";
            }
            else
            {
                result[i - 1]["status"] =
                    "available";
            }
        }


        return result;
    }
};


int main()
{

    crow::SimpleApp app;


    ParkingSystem parking;


    // Enable CORS
    CROW_ROUTE(app, "/")
    ([]()
    {
        crow::response res(
            "Smart Parking C++ Backend Running"
        );

        res.set_header(
            "Access-Control-Allow-Origin",
            "*"
        );

        return res;
    });


    // GET SLOTS
    CROW_ROUTE(app, "/slots")
    ([&]()
    {

        auto result =
            parking.getSlots();


        crow::response res(result);


        res.set_header(
            "Access-Control-Allow-Origin",
            "*"
        );


        return res;
    });


    // PARK VEHICLE
    CROW_ROUTE(app, "/park")
        .methods(crow::HTTPMethod::Post)
    ([&](const crow::request& req)
    {

        auto body =
            crow::json::load(req.body);


        if (!body)
        {
            return crow::response(
                400,
                "Invalid JSON"
            );
        }


        string vehicleNo =
            body["vehicleNo"].s();


        string type =
            body["type"].s();


        int slot;


        bool success =
            parking.parkVehicle(
                vehicleNo,
                type,
                slot
            );


        crow::json::wvalue result;


        if (success)
        {

            result["success"] = true;

            result["message"] =
                "Vehicle parked successfully! Slot: "
                + to_string(slot);

            result["slot"] = slot;

        }
        else
        {

            result["success"] = false;

            result["message"] =
                "Vehicle already parked or parking is full!";
        }


        crow::response res(result);


        res.set_header(
            "Access-Control-Allow-Origin",
            "*"
        );


        return res;
    });


    // REMOVE VEHICLE
    CROW_ROUTE(app, "/remove")
        .methods(crow::HTTPMethod::Post)
    ([&](const crow::request& req)
    {

        auto body =
            crow::json::load(req.body);


        if (!body)
        {
            return crow::response(
                400,
                "Invalid JSON"
            );
        }


        string vehicleNo =
            body["vehicleNo"].s();


        int hours =
            body["hours"].i();


        int fee = 0;


        bool success =
            parking.removeVehicle(
                vehicleNo,
                hours,
                fee
            );


        crow::json::wvalue result;


        if (success)
        {

            result["success"] = true;

            result["message"] =
                "Vehicle removed successfully! "
                "Parking Fee: Rs. "
                + to_string(fee);

            result["fee"] = fee;

        }
        else
        {

            result["success"] = false;

            result["message"] =
                "Vehicle not found!";
        }


        crow::response res(result);


        res.set_header(
            "Access-Control-Allow-Origin",
            "*"
        );


        return res;
    });


    // SEARCH VEHICLE
    CROW_ROUTE(app, "/search")
    ([&](const crow::request& req)
    {

        string vehicleNo =
            req.url_params.get("vehicle");


        Vehicle result(
            "",
            "",
            0
        );


        bool found =
            parking.searchVehicle(
                vehicleNo,
                result
            );


        crow::json::wvalue response;


        if (found)
        {

            response["found"] = true;

            response["vehicleNo"] =
                result.vehicleNo;

            response["type"] =
                result.type;

            response["slot"] =
                result.slot;
        }
        else
        {

            response["found"] = false;
        }


        crow::response res(response);


        res.set_header(
            "Access-Control-Allow-Origin",
            "*"
        );


        return res;
    });


    cout << endl;
    cout << "===================================="
         << endl;

    cout << " SMART PARKING C++ BACKEND"
         << endl;

    cout << "===================================="
         << endl;

    cout << "Server running on:"
         << endl;

    cout << "http://localhost:8080"
         << endl;

    cout << "===================================="
         << endl;


    app.port(8080)
       .multithreaded()
       .run();


    return 0;
}