module.exports = {
  friendlyName: 'Confirm',
  description: 'Confirm user.',

  inputs: {
    token: {
      type: 'string',
      description: "The confirmation token from the email.",
      example: "4-32fad81jdaf$329",
    },
  },

  exits: {
    success: {
      responseType: 'view',
      viewTemplatePath: 'layouts/general/success_page',
    },
    invalidOrExpiredToken: {
      statusCode: 400,
      description:
        "The provided token is expired, invalid, or already used up.",
    },
  },

  fn: async function (inputs, exits) {
    // Checks if request does not contain a token parameter
    if (!inputs.token) {
      return exits.invalidOrExpiredToken({
        error: "The provided token is expired, invalid, or already used up.",
      });
    }

    // Get user who was given token from database
    var user = await User.findOne({ emailProofToken: inputs.token });

    // Check if user exists / token is expired
    if (!user || user.emailProofTokenExpiresAt <= Date.now()) {
      return exits.invalidOrExpiredToken({
        error: "The provided token is expired, invalid, or already used up.",
      });
    }

    // Check email confirmation status
    if (user.emailStatus === "unconfirmed") {
      await User.updateOne({ id: user.id }).set({
        emailStatus: "confirmed",
        emailProofToken: "",
        emailProofTokenExpiresAt: 0,
      });
      return exits.success({
        message: "Your account has been confirmed",
      });
    }
  }
};
