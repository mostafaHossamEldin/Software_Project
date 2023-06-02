const db = require('../../connectors/db');
const roles = require('../../constants/roles');
const { getSessionToken } = require('../../utils/session');

const getUser = async function(req) {
  const sessionToken = getSessionToken(req);
  if (!sessionToken) {
    return res.status(301).redirect('/');
  }

  const user = await db.select('*')
    .from('se_project.sessions')
    .where('token', sessionToken)
    .innerJoin('se_project.users', 'se_project.sessions.userid', 'se_project.users.id')
    .innerJoin('se_project.roles', 'se_project.users.roleid', 'se_project.roles.id')
    .first();
  
  console.log('user =>', user)
  user.isStudent = user.roleid === roles.student;
  user.isAdmin = user.roleid === roles.admin;
  user.isSenior = user.roleid === roles.senior;

  return user;  
}

module.exports = function(app) {
  // Register HTTP endpoint to render /users page
  app.get('/dashboard', async function(req, res) {
    const user = await getUser(req);
    return res.render('dashboard', user);
  });
  app.get('/dashboardx', async function(req, res) {
    const user = await getUser(req);
    return res.render('dashboard', user);
  });

  app.get('/users/add', async function(req, res) {
    return res.render('add-user');
  });
  // Register HTTP endpoint to render /users page
  app.get('/users', async function(req, res) {
    const users = await db.select('*').from('se_project.users');
    const user = await getUser(req);

    return res.render('users', { users ,...user});
  });

  // Register HTTP endpoint to render /courses page
  app.get('/stations_example', async function(req, res) {
    const user = await getUser(req);
    const stations = await db.select('*').from('se_project.stations');
    return res.render('stations_example', { ...user, stations });
  });

  app.get('/resetPassword', async function(req, res) {
    const user = await getUser(req);
    return res.render('resetPassword', {...user});
  });
  
 app.get('/requests/refund', async function(req, res) {
  const user = await getUser(req);
  const userId = user.userId;
  const userTickets = await db("se_project.tickets")
  .where("userId", userId)
  .returning("*");
  return res.render('refund_request', {...user, userTickets});
 });

 app.get('/requests/senior', async function(req, res) {
  const user = await getUser(req);
  return res.render('senior_request', {...user});
 });

 app.get('/price', async function(req, res) {
  const user = await getUser(req);
  const stations = await db.select('*').from('se_project.stations');
  return res.render('price', { ...user, stations });
 });
 

};