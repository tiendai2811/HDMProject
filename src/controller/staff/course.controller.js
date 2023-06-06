const Courses = require("../../model/courses.model").model;
const Schedules = require("../../model/schedules.model").model;
const Categories = require("../../model/categories.model").model;
const Users = require("../../model/users.model").model;

//[GET] /staff/viewCourse
const show = async (req, res, next) => {
    try {
        const countDocumentsDeleted = await Courses.countDocumentsDeleted();
        const courses = await Courses.find({});
        let dateNow;
        for (let course of courses) {
            let category = await Categories.findOne({ _id: course.idCategory })
            course.nameCategory = category.name;
            let date = new Date(course.createdAt * 1000);
            if (date.getSeconds() < 10) {
                dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:0${date.getSeconds()}`;
            } else {
                dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
            }
            course.dateCreated = dateNow;
        }

        res.render("staff/courses/viewCourses", {
            courses: courses,
            countDocumentsDeleted,
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
        });
    } catch (err) {
        next(err);
    }
};
//[GET] /staff/viewCourse/create
const create = async (req, res, next) => {
    try {
        const categories = await Categories.find({});
        if (categories.length > 0) {
            return res.render("staff/courses/create", {
                categories: categories,
                rolePage: req.rolePage,
                link: `/${req.role}`,
                avatar: req.avatar,
                email: req.email,
            });
        }
    } catch (err) {
        next(err);
    }
};
//[POST] /staff/viewCourse/store
const store = async (req, res, next) => {
    try {
        await new Courses(req.body).save();
        res.redirect("/staff/viewCourses");
    } catch (err) {
        const categories = await Categories.find({});
        return res.render("staff/courses/create", {
            categories: categories,
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
            addFailed: true
        });
    }
};

//[GET] /staff/viewCourse/:id/edit
const edit = async (req, res, next) => {
    try {
        const categories = await Categories.find({});
        const course = await Courses.findOne({ _id: req.params.id });
        res.render("staff/courses/edit", {
            categories: categories,
            course: course,
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
        });
    } catch (err) {
        next(err);
    }
};
//[PUT] /staff/viewCourse/:id
const update = async (req, res, next) => {
    try {
        await Courses.updateOne({ _id: req.params.id }, req.body);
        res.redirect("/staff/viewCourses");
    } catch (err) {
        const categories = await Categories.find({});
        const course = await Courses.findOne({ _id: req.params.id });
        return res.render("staff/courses/edit", {
            categories: categories,
            course: course,
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
            addFailed: true
        });
    }
};

//[GET] /staff/viewCourse/search
const search = async (req, res, next) => {
    try {
        const countDocumentsDeleted = await Courses.countDocumentsDeleted();
        const search = req.query.search.trim();
        const course = await Courses.findOne({ name: search });
        let courses;
        let dateNow;
        if (course) {
            const category = await Categories.findOne({ _id: course.idCategory })
            course.nameCategory = category.name;
            let date = new Date(course.createdAt * 1000);
            if (date.getSeconds() < 10) {
                dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:0${date.getSeconds()}`;
            } else {
                dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
            }
            course.dateCreated = dateNow;
        }else{
            const searchCourses = new RegExp(search, "i");
            courses = await Courses.find({ name: searchCourses });
            for (let course of courses) {
                let category = await Categories.findOne({ _id: course.idCategory })
                course.nameCategory = category.name;
                let date = new Date(course.createdAt * 1000);
                if (date.getSeconds() < 10) {
                    dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:0${date.getSeconds()}`;
                } else {
                    dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                }
                course.dateCreated = dateNow;              
            }
        }
        res.render("staff/courses/viewCourses", {
            course: course,
            courses: courses,
            countDocumentsDeleted,
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
        });
    } catch (err) {
        next(err);
    }
};
//[DELETE] /staff/viewCourse/:id
const destroy = async (req, res, next) => {
    try {
        const course = await Courses.delete({ _id: req.params.id });
        // await Schedules.deleteMany({idCourse: req.params.id})
        res.redirect("back");
    } catch (err) {
        next(err);
    }
};
//[GET] /staff/viewCourse/trash/store
const storeTrash = async (req, res, next) => {
    try {
        const courses = await Courses.findDeleted({});
        const categories = await Categories.find({});
        let dateNow;
        for (let course of courses) {
            let date = new Date(course.deletedAt);
            if (date.getSeconds() < 10) {
                dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:0${date.getSeconds()}`;
            } else {
                dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
            }
            course.dateDeleted = dateNow;
            
        }
        res.render("staff/courses/trash", {
            courses: courses,
            categories: categories,
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
        });
    } catch (err) {
        next(err);
    }
};

//[PUT] /staff/viewCourse/:id/restore
const restore = async (req, res, next) => {
    try {
        await Courses.restore({ _id: req.params.id });
        res.redirect("back");
    } catch (err) {
        next(err);
    }
};
//[DELETE] /staff/viewCourse/:id/force
const deleteForce = async (req, res, next) => {
    try {
    await Courses.deleteOne({ _id: req.params.id });
    res.redirect("back");
    } catch (err) {
        next(err);
    }
};
//[GET] /staff/viewCourse/:id
const showDetail = async (req, res, next) => {
    try {
        const course = await Courses.findOne({ _id: req.params.id });
        const trainer = await Users.findOne({ $and: [{ role: "trainer" }, { _id: course.idTrainer }] });    
        const trainees = await Users.find({ $and: [{ role: "trainee" }, { _id: course.idTrainee }] });
        const category = await Categories.findOne({ _id: course.idCategory });
        course.nameCategory = category.name;
        if (trainer) {
            course.nameTrainer = trainer.name;
        } else {
            course.nameTrainer = null;
        }
        course.objTrainee = trainees;
        res.render("staff/courses/detailCourse", {
            course,
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
        });
    } catch (err) {
        next(err);
    }
};
//[POST] /staff/viewCourse/:id/addTrainee
const addTrainee = async (req, res, next) => {
    try {
        await Courses.updateOne(
            { _id: req.params.id },
            { $push: { idTrainee: req.body.traineeIds } }
        );
        res.redirect(`/staff/viewCourses/${req.params.id}`);
    } catch (err) {
        next(err);
    }
};
//[GET] /staff/viewCourse/:id/viewAddTrainee
const viewAddTrainee = async (req, res, next) => {
    try {
        const trainees = await Users.find({ role: "trainee" })
        const course = await Courses.findOne({ _id: req.params.id })
        const traineesOutCourse = [];
        const page = parseInt(req.query.page) || 1;
        const perPage = 5;
        let countPage;
        let arrayCountPage = [];
        let start = (page - 1) * perPage;
        let end = page * perPage;
        for (let trainee of trainees) {
            let courseIdTrainee = course.idTrainee.some((idTrainee) => {
                return idTrainee == trainee._id;
            })
            if (!courseIdTrainee) {
                traineesOutCourse.push(trainee);
            }
        }
        countPage = Math.ceil(traineesOutCourse.length / perPage);
        for(let i = 1; i <= countPage; i++) {
            arrayCountPage.push(i);
        }
        let pageIndex = page - 1;
        res.render("staff/courses/addTrainee", {
            course,
            countPage,
            pageIndex,
            arrayCountPage,
            trainees: traineesOutCourse.slice(start, end),
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
        });
    } catch (err) {
        next(err);
    }
};
//[DELETE] /staff/viewCourse/:id/deleteTrainee
const deleteTrainee = async (req, res, next) => {
    try {
        await Courses.updateOne(
            { _id: req.params.id },
            { $pull: { idTrainee: req.params.idTrainee } }
        )
        res.redirect("back");
    } catch (err) {
        next(err);
    }
};
//[GET] /staff/viewCourse/:id/viewAddTrainer
const viewAddTrainer = async (req, res, next) => {
    try {
        const trainers = await Users.find({ role: "trainer" })
        const course = await Courses.findOne({ _id: req.params.id })
        res.render("staff/courses/addTrainer", {
            trainers,
            course,
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
        });
    } catch (err) {
        next(err);
    }
};
//[POST] /staff/viewCourse/:id/addTrainer
const addTrainer = async (req, res, next) => {
    try {
        await Courses.updateOne(
            { _id: req.params.id },
            { idTrainer: req.body.trainerId }
        );
        res.redirect(`/staff/viewCourses/${req.params.id}`);
    } catch (err) {
        next(err);
    }
};
//[DELETE] /staff/viewCourse/:id/deleteTrainer
const deleteTrainer = async (req, res, next) => {
    try {
        await Courses.updateOne({ _id: req.params.id }, { idTrainer: "" })
        res.redirect("back");
    } catch (err) {
        next(err);
    }
};
const searchAddTrainer = async (req, res, next) => {
    try {
        const nameSearch = req.query.name.trim();
        let trainers = await Users.find({ $and: [{ role: 'trainer' }, { name: nameSearch }] })
        const course = await Courses.findOne({ _id: req.params.id })
        if (trainers.length == 0) {
            const search = new RegExp(nameSearch, 'i')
            trainers = await Users.find({ $and: [{ role: 'trainer' }, { name: search }] })
        }
        res.render("staff/courses/addTrainer", {
            trainers,
            course,
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
        });
    } catch (err) {
        next(err);
    }
}
const searchAddTrainee = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 3;
        let countPage;
        let arrayCountPage = [];
        let start = (page - 1) * perPage;
        let end = page * perPage;
        let nameSearch = req.query.name.trim();
        let trainees = await Users.find({ $and: [{ role: 'trainee' }, { name: nameSearch }] })
        const course = await Courses.findOne({ _id: req.params.id })
        if (trainees.length == 0) {
            const search = new RegExp(nameSearch, 'i')
            trainees = await Users.find({ $and: [{ role: 'trainee' }, { name: search }] })
        }
        const traineesOutCourse = [];
        for (let trainee of trainees) {
            let courseIdTrainee = course.idTrainee.some((idTrainee) => {
                return idTrainee == trainee._id;
            })
            if (!courseIdTrainee) {
                traineesOutCourse.push(trainee);
            }
        }
        countPage = Math.ceil(traineesOutCourse.length / perPage);
        for(let i = 1; i <= countPage; i++) {
            arrayCountPage.push(i);
        }
        let pageIndex = page - 1;
        res.render("staff/courses/addTrainee", {
            course,
            countPage,
            pageIndex,
            arrayCountPage,
            nameSearch,
            trainees: traineesOutCourse.slice(start, end),
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
        });
    } catch (err) {
        next(err);
    }
}

const course = {
    show,
    create,
    store,
    edit,
    update,
    search,
    destroy,
    storeTrash,
    restore,
    deleteForce,
    showDetail,
    addTrainee,
    viewAddTrainee,
    addTrainer,
    viewAddTrainer,
    deleteTrainee,
    deleteTrainer,
    searchAddTrainer,
    searchAddTrainee
};
module.exports = course;
