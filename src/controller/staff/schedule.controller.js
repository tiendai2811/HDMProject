const Schedules = require("../../model/schedules.model").model;
const Slots = require("../../model/slots.model").model;
const Courses = require("../../model/courses.model").model;
const Users = require("../../model/users.model").model;

//[GET] /staff/viewSchedule/create
const create = async (req, res, next) => {
    try {
        let slots = await Slots.find({}).exec()
        let courses = await Courses.find({}).exec()

        for (let course of courses) {
            const trainer = await Users.findOne({_id: course?.idTrainer}).exec()

            course.nameSelect = !trainer?.name ? course.name : `${course.name} (${trainer?.name})`;
        }

        res.render("staff/schedules/createSchedule",{
            slots,
            courses,
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
        });
    }catch (err) {
        return res.redirect('/staff/viewSchedule');
    }
};

//[POST] /staff/viewSchedule/store
const store = async (req, res, next) => {
    try{
        let schedules = await Schedules.find({$and : [{date: req.body.date}, {idSlot: req.body.idSlot}]}).exec()
        const course = await Courses.findOne({_id: req.body.idCourse}).exec()

        for (let schedule of schedules) {
            const courseSchedule = await Courses.findOne({_id: schedule?.idCourse}).exec()

            if (course?.idTrainer === courseSchedule?.idTrainer) {
                let slots = await Slots.find({}).exec()
                let courses = await Courses.find({}).exec()

                for (let course of courses) {
                    const trainer = await Users.findOne({_id: course?.idTrainer}).exec()

                    course.nameSelect = !trainer?.name ? course.name : `${course.name} (${trainer?.name})`;
                }

                return res.render("staff/schedules/createSchedule",{
                    error: "The trainer of this course has rescheduled this time",
                    addFailed : true,
                    slots,
                    courses,
                    ...req.body,
                    rolePage: req.rolePage,
                    link: `/${req.role}`,
                    avatar: req.avatar,
                    email: req.email,
                });
            }

            if (course?.idTrainee.some(value => courseSchedule?.idTrainee.includes(value))) {
                let slots = await Slots.find({}).exec()
                let courses = await Courses.find({}).exec()

                for (let course of courses) {
                    const trainer = await Users.findOne({_id: course?.idTrainer}).exec()

                    course.nameSelect = !trainer?.name ? course.name : `${course.name} (${trainer?.name})`;
                }

                return res.render("staff/schedules/createSchedule",{
                    addFailed : true,
                    error: "Some of the trainee of this course has rescheduled this time",
                    slots,
                    courses,
                    ...req.body,
                    rolePage: req.rolePage,
                    link: `/${req.role}`,
                    avatar: req.avatar,
                    email: req.email,
                });
            }
        }

        await new Schedules(req.body).save();
        return res.redirect('/staff/viewSchedule')
    }catch(err){
        return res.render("staff/schedules/createSchedule",{
            rolePage: req.rolePage,
            ...req.body,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
            addFailed : true,
        });
    }
};

//[GET] /staff/viewSchedule
const show = async (req, res, next) => {
    try {
        let schedules = await Schedules.find().exec()
        const page = parseInt(req.query.page) || 1;
        const perPage = 7;
        let countPage;
        let arrayCountPage = [];
        let start = (page - 1) * perPage;
        let end = page * perPage;
        let pageIndex = page - 1;

        for (let schedule of schedules) {
            const slot = await Slots.findOne({_id: schedule?.idSlot}).exec()
            const course = await Courses.findOne({_id: schedule?.idCourse}).exec()
            const trainer = await Users.findOne({_id: course?.idTrainer}).exec()

            schedule.slot = `${slot?.name} (${slot?.startTime} - ${slot?.endTime})`;
            schedule.course = !trainer?.name ? course?.name : `${course?.name} (${trainer?.name})`;
            schedule.time = schedule.date.toDateString()
        }

        countPage = Math.ceil(schedules.length / perPage);

        for(let i = 1; i <= countPage; i++) {
            arrayCountPage.push(i);
        }

        return res.render("staff/schedules/viewSchedule", {
            schedules: schedules.slice(start, end),
            countPage,
            pageIndex,
            arrayCountPage,
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
        });
    }
    catch(err) {
        return next(err);
    }
};

//[GET] /staff/viewSchedule/:id/edit
const edit = async (req, res, next) => {
    try {
        let schedule = await Schedules.findOne({ _id: req.params.id }).exec()
        let slots = await Slots.find({}).exec()
        let courses = await Courses.find({}).exec()

        for (let course of courses) {
            const trainer = await Users.findOne({_id: course?.idTrainer}).exec()

            course.nameSelect = !trainer?.name ? course.name : `${course.name} (${trainer?.name})`;
        }

        schedule.dateFormatted = `${schedule.date.getFullYear()}-${schedule.date.getMonth() > 10 ? (schedule.date.getMonth() + 1) : "0" + (schedule.date.getMonth() + 1)}-${schedule.date.getDate() > 10 ? schedule.date.getDate() : "0" + schedule.date.getDate()}`

        return res.render("staff/schedules/editSchedule", {
            schedule: schedule,
            slots,
            courses,
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
        });
    }
    catch(err){
        return res.render("staff/schedules/editSchedule",{
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
            addFailed : true,
        });
    }
};

//[GET] /staff/viewSchedule/:id/edit
const detail = async (req, res, next) => {
    try {
        let schedule = await Schedules.findOne({ _id: req.params.id }).exec()
        const slot = await Slots.findOne({_id: schedule?.idSlot}).exec()
        const course = await Courses.findOne({_id: schedule?.idCourse}).exec()
        const trainer = await Users.findOne({_id: course?.idTrainer}).exec()
        const trainees = await Users.find({ $and: [{ role: "trainee" }, { _id: course.idTrainee }] });

        let idTraineeNotPresent = [];
        for (let trainee of trainees) {
            trainee.attendance = null;

            if (schedule.idPresent.includes(trainee._id)) {
                trainee.attendance = true;
                continue;
            }

            if (schedule.idAbsent.includes(trainee._id)) {
                trainee.attendance = false;
            }

            idTraineeNotPresent.push(trainee._id)
        }

        if (schedule.date < new Date() && (schedule.idPresent.length + schedule.idAbsent.length) < trainees.length) {
            await Schedules.updateOne({ _id: req.params.id }, {
                idAbsent: idTraineeNotPresent
            })

            for (let trainee of trainees) {
                if (idTraineeNotPresent.includes(trainee._id)) {
                    trainee.attendance = false;
                }
            }
        }

        schedule.slot = `${slot?.name} (${slot?.startTime} - ${slot?.endTime})`;
        schedule.nameCourse = course.name;
        schedule.nameTrainer = trainer?.name;
        schedule.time = schedule.date?.toDateString();
        schedule.trainees = trainees;
        schedule.time = schedule.date.toDateString()

        schedule.dateFormatted = `${schedule.date.getFullYear()}-${schedule.date.getDate() > 10 ? schedule.date.getDate() : "0" + schedule.date.getDate()}-${schedule.date.getMonth() > 10 ? schedule.date.getMonth() : "0" + schedule.date.getMonth()}`

        res.render("staff/schedules/detailSchedule", {
            schedule: schedule,
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
        });
    }
    catch(err){
        res.redirect("/staff/viewSchedule")
    }
};

//[PUT] /staff/viewSchedule/:id
const update = async (req, res, next) => {
    try{
        let schedules = await Schedules.find({$and : [{date: req.body.date}, {idSlot: req.body.idSlot}],
            $not: {_id: req.params.id}}).exec()
        const course = await Courses.findOne({_id: req.body.idCourse}).exec()

        for (let schedule of schedules) {
            const courseSchedule = await Courses.findOne({_id: schedule?.idCourse}).exec()

            if (course?.idTrainer === courseSchedule?.idTrainer) {
                let schedule = await Schedules.findOne({ _id: req.params.id }).exec()
                let slots = await Slots.find({}).exec()
                let courses = await Courses.find({}).exec()

                for (let course of courses) {
                    const trainer = await Users.findOne({_id: course?.idTrainer}).exec()

                    course.nameSelect = !trainer?.name ? course.name : `${course.name} (${trainer?.name})`;
                }

                schedule.dateFormatted = `${schedule.date.getFullYear()}-${schedule.date.getMonth() > 10 ? (schedule.date.getMonth() + 1) : "0" + (schedule.date.getMonth() + 1)}-${schedule.date.getDate() > 10 ? schedule.date.getDate() : "0" + schedule.date.getDate()}`

                return res.render("staff/schedules/editSchedule",{
                    error: "The trainer of this course has rescheduled this time",
                    schedule: schedule,
                    addFailed : true,
                    slots,
                    courses,
                    rolePage: req.rolePage,
                    link: `/${req.role}`,
                    avatar: req.avatar,
                    email: req.email,
                });
            }

            if (course?.idTrainee.some(value => courseSchedule?.idTrainee.includes(value))) {
                let slots = await Slots.find({}).exec()
                let courses = await Courses.find({}).exec()
                let schedule = await Schedules.findOne({ _id: req.params.id }).exec()

                for (let course of courses) {
                    const trainer = await Users.findOne({_id: course?.idTrainer}).exec()

                    course.nameSelect = !trainer?.name ? course.name : `${course.name} (${trainer?.name})`;
                }

                schedule.dateFormatted = `${schedule.date.getFullYear()}-${schedule.date.getMonth() > 10 ? (schedule.date.getMonth() + 1) : "0" + (schedule.date.getMonth() + 1)}-${schedule.date.getDate() > 10 ? schedule.date.getDate() : "0" + schedule.date.getDate()}`

                return res.render("staff/schedules/editSchedule",{
                    addFailed : true,
                    error: "Some of the trainee of this course has rescheduled this time",
                    slots,
                    courses,
                    schedule: schedule,
                    rolePage: req.rolePage,
                    link: `/${req.role}`,
                    avatar: req.avatar,
                    email: req.email,
                });
            }
        }

        await Schedules.updateOne({ _id: req.params.id }, req.body)
        return res.redirect('/staff/viewSchedule');
    }catch(err){
        let schedule = await Schedules.findOne({ _id: req.params.id })
        res.render("staff/schedules/editSchedule", {
            schedule: schedule,
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
            addFailed : true,
        });
    }

};

//[DELETE] /staff/viewSchedule/:id
const destroy = async (req, res, next) => {
    try {
        await Schedules.deleteOne({ _id: req.params.id })
        res.redirect("/staff/viewSchedule")
    }
    catch(err) {
        next(err);
    }
};

//[GET] /staff/viewSchedule/search
const search = async (req, res, next) => {
    try {
        let schedules = await Schedules.find().exec()
        const page = parseInt(req.query.page) || 1;
        const perPage = 7;
        let countPage;
        let arrayCountPage = [];
        let start = (page - 1) * perPage;
        let end = page * perPage;
        let pageIndex = page - 1;

        const searchSchedule = new RegExp(req.query.search, "i");

        let results = [];

        for (let schedule of schedules) {
            const slot = await Slots.findOne({_id: schedule?.idSlot}).exec()
            const course = await Courses.findOne({_id: schedule?.idCourse}).exec()
            const trainer = await Users.findOne({_id: course?.idTrainer}).exec()

            schedule.slot = `${slot?.name} (${slot?.startTime} - ${slot?.endTime})`;
            schedule.course = !trainer?.name ? course.name : `${course.name} (${trainer?.name})`;
            schedule.time = schedule.date.toDateString();

            if (schedule.time.match(searchSchedule) ||
                schedule.course.match(searchSchedule) ||
                schedule.slot.match(searchSchedule)
            ) {
                results.push(schedule)
            }
        }

        if (results) {
            countPage = Math.ceil(results.length / perPage);
        } else {
            schedules = Math.ceil(schedules.length / perPage);
        }

        for(let i = 1; i <= countPage; i++) {
            arrayCountPage.push(i);
        }

        res.render("staff/schedules/viewSchedule", {
            nameSearch: req.query.search,
            schedules: req.query.search ? results.slice(start, end) : schedules.slice(start, end),
            countPage,
            pageIndex,
            arrayCountPage,
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
        });
    }
    catch (err) {
        next(err);
    }
};

const attendance = async (req, res, next) => {
    try {
        const presents = req.body.presents.split(',').map(present => Number(present))
        const absents = req.body.absents.split(',').map(absent => Number(absent))

        await Schedules.updateOne({ _id: req.params.id }, {
            idPresent: presents,
            idAbsent: absents
        })

        return res.redirect('/staff/viewSchedule');
    }catch (err) {
        next(err);
    }
}

const schedule = {
    create,
    store,
    show,
    edit,
    update,
    destroy,
    search,
    detail,
    attendance
};

module.exports = schedule;
