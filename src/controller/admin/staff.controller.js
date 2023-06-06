var Staffs = require('../../model/users.model').model;

//[GET] /staff/viewStaff
const show = async (req, res, next) => {
    const staffs = await Staffs.find({ role: 'staff' });
    let dateNow;
    for (let staff of staffs) {
        let date = new Date(staff.createdAt * 1000);
        if (date.getSeconds() < 10) {
            dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:0${date.getSeconds()}`;
        } else {
            dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        }
        staff.dateCreated = dateNow;
    }
    return res.render('admin/staff/viewStaff', {
        staffs: staffs,
        rolePage: req.rolePage,
        link: `/${req.role}`,
        avatar: req.avatar,
        email: req.email
    });
}
const getCreate = async (req, res) => {
    return res.render('admin/staff/createStaff', {
        rolePage: req.rolePage,
        link: `/${req.role}`,
        avatar: req.avatar,
        email: req.email
    });
}

const create = async (req, res) => {
    try {
        await new Staffs({
            name: req.body.name,
            email: req.body.email,
            age: req.body.age,
            phone: req.body.phone,
            address: req.body.address,
            role: "staff",
        }).save();
        return res.redirect('/admin/viewStaff')
    } catch (err) {
        return res.render("admin/staff/createStaff", {
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
            addFailed: true,
        });
    }

}

const edit = async (req, res, next) => {
    try {
        let staff = await Staffs.findOne({ _id: req.params.id })
        res.render("admin/staff/editStaff", {
            staff: staff,
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
        });
    }
    catch (err) {
        return res.render("admin/staff/editStaff", {
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
            addFailed: true,
        });
    }
}

const update = async (req, res, next) => {
    try {
        await Staffs.updateOne({ _id: req.params.id }, req.body)
        return res.redirect('/admin/viewStaff');
    } catch (err) {
        let staff = await Staffs.findOne({ _id: req.params.id })
        res.render("admin/staff/editStaff", {
            staff: staff,
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
            addFailed: true,
        });
    }
}

const deleteS = async (req, res, next) => {
    Staffs.deleteOne({ _id: req.params.id })
        .then(() => {
            res.redirect('/admin/viewStaff')
        })
        .catch(next)
}

const search = async (req, res, next) => {
    try {
        let staff = await Staffs.findOne({
            $and: [{ name: req.query.search }, { role: "trainee" }],
        })
        let staffs;
        let dateNow;
        if (staff) {
            let date = new Date(staff.createdAt * 1000);
            if (date.getSeconds() < 10) {
                dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:0${date.getSeconds()}`;
            } else {
                dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
            }
            staff.dateCreated = dateNow;
        }
        if (staff) {
            return res.render("admin/staff/viewStaff", {
                staff: staff,
                rolePage: req.rolePage,
                link: `/${req.role}`,
                avatar: req.avatar,
                email: req.email,
            });
        }
        const searchStaff = new RegExp(req.query.search, "i");
        staffs = await Staffs.find({ $and: [{ name: searchStaff }, { role: "staff" }] })
        for (let staff of staffs) {
            let date = new Date(staff.createdAt * 1000);
            if (date.getSeconds() < 10) {
                dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:0${date.getSeconds()}`;
            } else {
                dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
            }
            staff.dateCreated = dateNow;
        }
        res.render("admin/staff/viewStaff", {
            staffs: staffs,
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

const staff = {
    show,
    create,
    getCreate,
    edit,
    update,
    deleteS,
    search
}

module.exports = staff