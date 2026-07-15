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

app.post("/teachers", async (req, res) => {
    let { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({
            message: "Lütfen tüm alanları doldurun."
        });
    }

    email = email.toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            message: "Geçerli bir email adresi giriniz."
        });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: "Şifre en az 6 karakter olmalı ve en az bir harf ile bir sayı içermelidir."
        });
    }

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        return res.status(409).json({
            message: "Bu email adresi ile zaten bir hesap bulunmaktadır."
        });
    }

    await prisma.user.create({
        data: {
            fullName,
            email,
            password,
            role: "TEACHER"
        }
    });

    res.json({
        message: "Öğretmen başarıyla oluşturuldu."
    });
});


app.get("/teachers", async (_req, res) => {
    const teachers = await prisma.user.findMany({
        where: {
            role: "TEACHER"
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true
        }
    });

    res.json(teachers);
});

app.put("/teachers/:id", async (req, res) => {
    const id = Number(req.params.id);

    const existing = await prisma.user.findFirst({
        where: {
            id,
            role: "TEACHER"
        }
    });

    if (!existing) {
        return res.status(404).json({
            message: "Öğretmen bulunamadı."
        });
    }

    let { fullName, email, password } = req.body;

    // Boş alan kontrolü
    if (!fullName || !email || !password) {
        return res.status(400).json({
            message: "Lütfen tüm alanları doldurun."
        });
    }

    // Email küçük harfe çevir
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

    // Email başka bir kullanıcı tarafından kullanılıyor mu?
    const emailExists = await prisma.user.findFirst({
        where: {
            email,
            NOT: {
                id
            }
        }
    });

    if (emailExists) {
        return res.status(409).json({
            message: "Bu email adresi zaten kullanılmaktadır."
        });
    }

    const updated = await prisma.user.update({
        where: {
            id
        },
        data: {
            fullName,
            email,
            password
        }
    });

    res.json(updated);
});


app.post("/teachers/:id/lessons", async (req, res) => {

    const teacherId = Number(req.params.id);

    const {
        title,
        day,
        start,
        end,
        color
    } = req.body;


    // Öğretmen var mı kontrolü
    const teacher = await prisma.user.findFirst({
        where: {
            id: teacherId,
            role: "TEACHER"
        }
    });


    if (!teacher) {
        return res.status(404).json({
            message: "Öğretmen bulunamadı."
        });
    }


    // Boş alan kontrolü
    if (!title || !day || !start || !end || !color) {
        return res.status(400).json({
            message: "Lütfen tüm alanları doldurun."
        });
    }


    // Saat kontrolü
    if (end <= start) {
        return res.status(400).json({
            message: "Bitiş saati başlangıç saatinden sonra olmalıdır."
        });
    }


    // Aynı saatte başka ders var mı?
    const conflict = await prisma.lesson.findFirst({
        where: {
            teacherId,
            day,
            AND: [
                {
                    start: {
                        lt: end
                    }
                },
                {
                    end: {
                        gt: start
                    }
                }
            ]
        }
    });


    if (conflict) {
        return res.status(409).json({
            message: "Bu saat aralığında başka bir ders bulunmaktadır."
        });
    }


    const lesson = await prisma.lesson.create({
        data: {
            title,
            day,
            start,
            end,
            color,
            teacherId
        }
    });


    res.json({
        message: "Ders başarıyla eklendi.",
        lesson
    });

});

app.get("/teachers/:id/lessons", async (req, res) => {

    const teacherId = Number(req.params.id);


    const teacher = await prisma.user.findFirst({
        where: {
            id: teacherId,
            role: "TEACHER"
        }
    });


    if (!teacher) {
        return res.status(404).json({
            message: "Öğretmen bulunamadı."
        });
    }


    const lessons = await prisma.lesson.findMany({
        where: {
            teacherId
        },
        orderBy: {
            start: "asc"
        }
    });


    res.json(lessons);

});


app.delete("/lessons/:id", async (req, res) => {

    const lessonId = Number(req.params.id);


    const deleted = await prisma.lesson.deleteMany({
        where: {
            id: lessonId
        }
    });


    if (deleted.count === 0) {
        return res.status(404).json({
            message: "Ders bulunamadı."
        });
    }


    res.json({
        message: "Ders başarıyla silindi."
    });

});

app.delete("/teachers/:id", async (req, res) => {
    const id = Number(req.params.id);

    const deleted = await prisma.user.deleteMany({

        where: { id, role: "TEACHER" }
    });

    if (deleted.count === 0) {
        return res.status(404).json({
            message: "Öğretmen bulunamadı."
        });
    }

    res.json({
        message: "Öğretmen silindi."
    });
});



app.listen(3000, () => {

    console.log("Server 3000 portunda çalışıyor.");

});