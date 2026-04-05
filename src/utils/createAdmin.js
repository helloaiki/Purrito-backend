import bcrypt from "bcryptjs";
import db from "../db.js";

const createAdmin = async () => {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    console.log(email,password)

    try
    {
        const [rows] = await db.query(
        "SELECT * FROM admin WHERE email_address = ?", [email]
        );
        if (rows.length === 0) {
        const hash = await bcrypt.hash(password, 8);
        await db.query(
            "INSERT INTO admin (email_address, password) VALUES (?, ?)",
            [email, hash]
        );
        console.log("Admin created successfully");
        } else {
            console.log("Admin already exists");
        }
    }
    catch(err)
    {
        console.log('Error at createAdmin')
    }

    
    
};

export default createAdmin;
