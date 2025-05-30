const handleSignin = (req, res, knex, bcrypt) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json("Missing fields"); // This is returned to avoid the app continuing after getting a 400
  }

  knex
    .select("email", "hash")
    .from("login")
    .where("email", "=", email)
    .then((data) => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      // console.log(isValid);
      if (isValid) {
        return knex // always return
          .select("*")
          .from("users")
          .where("email", "=", email)
          .then((user) => {
            // console.log(user);
            res.json(user[0]);
          })
          .catch((err) => {
            res.status(400).json("unable to get user");
          });
      } else {
        res.status(400).json("wrong credentials");
      }
    })
    .catch((err) => res.status(400).json("wrong credentials"));
};

module.exports = {
  handleSignin,
};
