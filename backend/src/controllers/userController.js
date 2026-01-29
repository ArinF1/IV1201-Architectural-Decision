exports.getAllUsers = async (req, res, next) => {
  try {
    res.status(200).json({ message: 'Get all users' });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.status(200).json({ message: `Get user ${id}` });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.status(200).json({ message: `User ${id} updated` });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.status(200).json({ message: `User ${id} deleted` });
  } catch (error) {
    next(error);
  }
};
