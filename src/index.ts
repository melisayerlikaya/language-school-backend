import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const app = express();

app.use(express.json());
app.use(cors());


app.get("/", (req, res) => {
    res.send("Backend çalışıyor!");
});


app.get("/test", (req, res) => {
    res.send("Test başarılı!");
});



app.post("/register", async (req, res) => {

    let { fullName, email, password } = req.body;


    // Boş alan kontrolü
    if (!fullName || !email || !password) {
        return res.status(400).json({
            message: "Lütfen tüm alanları doldurun."
        });
    }


    // Email küçük harfe çevirme
    email = email.toLowerCase().trim();



    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailRegex.test(email)) {
        return res.status(400).json({
            message: "Geçerli bir email adresi giriniz."
        });
    }



    // Şifre kontrolü
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;


    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: "Şifre en az 6 karakter olmalı ve en az bir harf ile bir sayı içermelidir."
        });
    }



    // Email daha önce kayıtlı mı?
    const existingUser = await prisma.user.findUnique({
        where: {
            email: email
        }
    });



    if (existingUser) {
        return res.status(409).json({
            message: "Bu email adresi ile zaten bir hesap bulunmaktadır."
        });
    }



    // Kullanıcı oluştur
    await prisma.user.create({
        data: {
            fullName,
            email,
            password,
            role: "ADMIN"
        }
    });



    res.json({
        message: "Kayıt başarılı! Giriş yapabilirsiniz."
    });

});



app.post("/login", async (req, res) => {

    let { email, password } = req.body;


    // Boş alan kontrolü
    if (!email || !password) {
        return res.status(400).json({
            message: "Lütfen email ve şifre giriniz."
        });
    }


    // Email küçük harfe çevirme
    email = email.toLowerCase();



    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailRegex.test(email)) {
        return res.status(400).json({
            message: "Geçerli bir email adresi giriniz."
        });
    }



    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });



    if (!user) {

        return res.status(404).json({
            message: "Bu email ile kayıtlı bir hesap bulunamadı."
        });

    }



    if (user.password !== password) {

        return res.status(401).json({
            message: "Şifre yanlış."
        });

    }



    res.json({
        message: "Giriş başarılı!",
        user: {
            id: user.id,
            fullName: user.fullName,
            role: user.role
        }
    });

});



app.listen(3000, () => {

    console.log("Server 3000 portunda çalışıyor.");

});