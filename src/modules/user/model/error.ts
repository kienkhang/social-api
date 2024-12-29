export const ErrNameAtLeast2Chars = new Error(
  "Name must be at least 2 characters"
);
export const ErrPasswordAtLeast6Chars = new Error(
  "Password must be at least 6 characters"
);
export const ErrInvalidEmailAndPassword = new Error(
  "Invalid username and password"
);
export const ErrUsernameInvalid = new Error(
  "Username must contain only letters, numbers and underscore (_)"
);
export const ErrUserInactivated = new Error("User is inactivated or banned");
export const ErrUsernameExisted = new Error("Username is already existed");
