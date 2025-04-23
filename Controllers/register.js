const handleRegister = (req, res, knex, bcrypt) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json("Missing fields"); // This is returned to avoid the app continuing after getting a 400
  }

  const hash = bcrypt.hashSync(password);

  knex.transaction(async (trx) => {
    try {
      const loginEmail = await trx("login")
        .insert({ hash, email })
        .returning("email");
      const user = await trx("users").returning("*").insert({
        email: loginEmail[0].email,
        name,
        joined: new Date(),
      });

      res.json(user[0]);
      await trx.commit();
    } catch (err) {
      await trx.rollback();
      console.error(err);
      res.status(400).json("Unable to register");
    }
  });
};

module.exports = {
  handleRegister,
};
