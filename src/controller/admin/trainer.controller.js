const Trainers = require('../../model/users.model').model;

const show = async (req, res, next) => {
    const trainers = await Trainers.find({ role: 'trainer' });
    let dateNow;
    for (let trainer of trainers) {
      let date = new Date(trainer.createdAt * 1000);
      if (date.getSeconds() < 10) {
        dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:0${date.getSeconds()}`;
      } else {
        dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
      }
      trainer.dateCreated = dateNow;
    }
    return res.render('admin/trainer/viewTrainer', {
        trainers: trainers,
        rolePage: req.rolePage,
        link: `/${req.role}`,
        avatar: req.avatar,
        email: req.email
    });
}
const getCreate = async (req, res) => {
    return res.render('admin/trainer/createTrainer', {
        rolePage: req.rolePage,
        link: `/${req.role}`,
        avatar: req.avatar,
        email: req.email
    });
}


const create = async (req, res) => {
    try {
        await new Trainers({
            name: req.body.name,
            email: req.body.email,
            age: req.body.age,
            phone: req.body.phone,
            address: req.body.address,
            role: "trainer",
        }).save();
        return res.redirect('/admin/viewTrainer')
    } catch (err) {
        return res.render("admin/trainer/createTrainer", {
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
        let trainer = await Trainers.findOne({ _id: req.params.id })
        res.render("admin/trainer/editTrainer", {
            trainer: trainer,
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
        });
    }
    catch (err) {
        return res.render("admin/trainer/editTrainer", {
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
        await Trainers.updateOne({ _id: req.params.id }, req.body)
        return res.redirect('/admin/viewTrainer');
    } catch (err) {
        let trainer = await Trainers.findOne({ _id: req.params.id })
        res.render("admin/trainer/editTrainer", {
            trainer: trainer,
            rolePage: req.rolePage,
            link: `/${req.role}`,
            avatar: req.avatar,
            email: req.email,
            addFailed: true,
        });
    }
}



const deleteS = async (req, res, next) => {
    Trainers.deleteOne({ _id: req.params.id })
        .then(() => {
            res.redirect('/admin/viewTrainer')
        })
        .catch(next)
}

//[GET] /adminh/viewTrainer/search
const search = async (req, res, next) => {
    try {
        let trainer = await Trainers.findOne({
            $and: [{ name: req.query.search }, { role: "trainee" }],
        })
        let trainers;
        let dateNow;
        if (trainer) {
            let date = new Date(trainer.createdAt * 1000);
            if (date.getSeconds() < 10) {
                dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:0${date.getSeconds()}`;
            } else {
                dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
            }
            trainer.dateCreated = dateNow;
        }
        if (trainer) {
            return res.render("admin/trainer/viewTrainer", {
                trainer: trainer,
                rolePage: req.rolePage,
                link: `/${req.role}`,
                avatar: req.avatar,
                email: req.email,
            });
        }
        const searchTrainer = new RegExp(req.query.search, "i");
        trainers = await Trainers.find({ $and: [{ name: searchTrainer }, { role: "trainer" }] })
        for (let trainer of trainers) {
            let date = new Date(trainer.createdAt * 1000);
            if (date.getSeconds() < 10) {
                dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:0${date.getSeconds()}`;
            } else {
                dateNow = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
            }
            trainer.dateCreated = dateNow;
        }
        res.render("admin/trainer/viewTrainer", {
            trainers: trainers,
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

const trainer = {
    show,
    create,
    getCreate,
    edit,
    update,
    deleteS,
    search
}

module.exports = trainer