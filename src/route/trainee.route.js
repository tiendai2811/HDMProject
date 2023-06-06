const express = require('express');
const router = express.Router();
const trainee = require('../controller/student/student.controller');

router.get('/showalltrainees/:id', trainee.showTrainees);
router.get('/searchcourses', trainee.searchCourses);
router.get('/searchcourses/:idCategory', trainee.searchCoursesInCategory);
router.get('/searchtrainees/:id/', trainee.searchTrainees);
router.get('/viewSchedules/:id/', trainee.viewSchedules);
router.get('/viewSchedules/:id/search', trainee.searchSchedules);
router.get('/:idCategory', trainee.showCoursesInCategory);
router.get('/', trainee.showCourses);

module.exports = router;