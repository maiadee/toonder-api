export default function errorHandler(e, req, res, next) {
  console.log(e, e.name);

  if (e.name === "CastError") {
    return res.status(400).json({
      message:
        "Hey, the ID you provided was not valid. Please provide a valid ID!",
    });
  } else if (e.code === 11000) {
    const identifier = Object.keys(e.keyValue)[0];
    return res.status(409).json({
      errors: {
        [identifier]: `That ${identifier} already exists. Please try another one.`,
      },
    });
  } else if (e.name === "ValidationError") {
    const customError = {};
    for (const key in e.errors) {
      customError[key] = e.errors[key].message;
    }
    res.status(422).send({
      errors: customError,
      message: "There are issues with the data you posted.",
    });
  } else {
    res.status(500).send({
      message:
        "🔥 Uh-oh! Something went wrong on our end. Give us a moment and try again.",
    });
  }
}
