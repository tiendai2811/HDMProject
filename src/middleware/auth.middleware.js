
const verifyUser = (req, res, next)=>{
    const user = req.session.user;
    if(!user) return res.redirect('/');
    const rolePage = user.role[0].toUpperCase() + user.role.substr(1);
    req.id = user.id;
    req.role = user.role;
    req.email = user.email;
    req.avatar = user.avatar;
    req.rolePage = rolePage;
    next();
}

const checkLogout = (req, res, next) => {
    const user = req.session.user;
    if(!user) next();
    else{
        switch(user.role){
            case 'admin':
                res.redirect('/admin')
            break;
            case 'staff':
                res.redirect('/staff');
            break;
            case 'trainer':
                res.redirect('/trainer')
            break;
            case 'trainee':
                res.redirect('/trainee')
            break;
            default :
                res.redirect('/profile')
            break;
        }
    }
}

const isAdmin = (req, res, next) => {
    const role = req.role;
    if(role === 'admin') {
        next();
    } else return res.redirect('/');
}

const isStaff = (req, res, next) => {
    const role = req.role;
    if(role === 'staff') {
        next();
    } else return res.redirect('/');
}

const isTrainer = (req, res, next) => {
    const role = req.role;
    if(role === 'trainer') {
        next();
    } else return res.redirect('/');
}

const isTrainee = (req, res, next) => {
    const role = req.role;
    if(role === 'trainee') {
        next();
    } else return res.redirect('/');
}

const authenticate = {
    verifyUser,
    checkLogout,
    isAdmin,
    isStaff,
    isTrainer,
    isTrainee,
}

module.exports = authenticate;
