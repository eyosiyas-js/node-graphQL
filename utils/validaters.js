module.exports.ValidateRegisterUser = (
  username,
  email,
  password,
  confirmPassword
) => {
  const errors = {};
  if (username.trim() === "") {
    errors.username = "username must not be empty";
  }

  if (email.trim() === "") {
    errors.email = "email must not be empty";
  } else {
    const regX =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!email.match(regX)) {
      errors.email = "email must be a valid email address";
    }
  }

  if (password.trim() === "") {
    errors.password = "password must not be empty";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "password does not much";
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};

module.exports.ValidateLoginUser = (username, password) => {
  const errors = {};
  if (username.trim() === "") {
    errors.username = "username must not be empty";
  }
  if (password.trim() === ""){
      errors.password = "password must not be empty"
  }
   return {
     errors,
     valid: Object.keys(errors).length < 1,
   };
};
