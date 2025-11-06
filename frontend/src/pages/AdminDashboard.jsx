import React, { useEffect, useState } from 'react'

const AdminDashboard = () => {

    const [drivers, setDrivers] = useState([])
    const [settledDriver, setSettledDriver] = useState(null)
    const [amount, setAmount] = useState(0)

    useEffect(() => {
        fetchAllDrivers()
    }, [])
    
    async function settleHandler (driver) {
        console.log("Payout handler called for driver: ", driver)
        console.log("Amount to settle: ", amount)

        const body = {
            amount,
            fund_account_id: driver.razorpayFundAccountId,
            referenceId: driver._id
        }

        try {
            
            const res = await fetch(`http://localhost:3000/payout/createPayoutViaUpi/${driver._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(body)
            })

            const data = await res.json()
            console.log("Payout response data: ", data)

            // Refresh the drivers list after payout
            fetchAllDrivers()

        } catch (error) {
            
        }
        
    }

    const fetchAllDrivers = async () => {
        try {
            const res = await fetch("http://localhost:3000/admin/allDrivers", {
                credentials: "include"
            })

            const data = await res.json()
            console.log("data: ", data)
            setDrivers(data)
        } catch (error) {
            console.log("error in fetchAllDrivers: ", error)
            throw error
        }
    }

    return (
        <div>
            {
                drivers.map((driver, index) => {
                    return (
                        <div key={index}>
                            <ul className="list bg-base-100 rounded-box shadow-md">

                                <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Make Payouts</li>

                                <li className="list-row">
                                    <div><img className="size-10 rounded-box" src={driver.image} /></div>
                                    <div>
                                        <div>{driver.firstName} {driver.lastName}<br />
                                            email: {driver.emailId} <br /> phone: {driver.phoneNumber} | age: {driver.age}
                                        </div>
                                        <div className="text-xs uppercase font-semibold opacity-60">
                                            <br />{driver.vehicle.vehicleType} - {driver.vehicle.vehicleName}
                                            <h3>pendingBalance: {driver.pendingBalance} | totalEarnings: {driver.totalEarnings} | availableBalance: {driver.availableBalance}</h3>
                                        </div>
                                    </div>
                                    <button className="btn btn-square btn-secondary"
                                        onClick={() => setSettledDriver(driver)}>
                                        Settle Payment
                                    </button>

                                    {
                                        settledDriver && <div>
                                            <input type="text"
                                                placeholder="Enter amount to settle"
                                                className="input input-bordered input-sm w-full max-w-xs mb-2"
                                                onChange={(e) => setAmount(e.target.value)}
                                            />
                                            <button className="btn btn-primary"
                                                onClick={() => settleHandler(driver)}>
                                                Confirm Payout to {driver.firstName}
                                            </button>
                                        </div>

                                    }

                                </li>

                            </ul>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default AdminDashboard
