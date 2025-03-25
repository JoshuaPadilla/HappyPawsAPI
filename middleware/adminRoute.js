export const restrictToAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "failed",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  } catch (error) {
    console.log("restrict admin error:", error);
    res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};
