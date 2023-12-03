import expressAsyncHandler from "express-async-handler";
import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";
import {
  JWTToken,
  comparePassword,
  hashPassword,
  reqTwoFactorAuth,
  sendEmail,
  throwError,
  verifyTwoFactorAuth,
} from "../../helpers";
import prisma from "../../configuration/prisma-client";
import cron from "node-cron";

export const createUser = expressAsyncHandler(async (req, res, next) => {
  const errors = validationResult(req.body);
  if (!errors.isEmpty()) {
    throwError("Invalid inputs", StatusCodes.BAD_REQUEST, true);
  }
  try {
    const { name, password, email, gender, dob } = req.body;

    const findUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (findUser) {
      throwError("User Already exist", StatusCodes.BAD_REQUEST, true);
    }
    const { token, secret } = await reqTwoFactorAuth();

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name as string,
        passwords: hashedPassword,
        email: email,
        gender: gender,
        verify_otp: false,
        dob: dob,
        otp_trial: token,
        otp_secret: secret.base32,
      },
    });

    const content = `
  <body style="font-family: sans-serif; padding: 0; max-width: 600px; margin: 0 auto">
    <header
      style="
        text-align: center;
        background-color:#d9d9d9;
        display: flex;
        align-items: center;
        margin: 0 auto;
        justify-content: center;
      ">
      <img
        src="http://res.cloudinary.com/dynkejvim/image/upload/v1700235033/stewart/puv5v0bxq3zrojoqy2hn.png"
        alt="Stewart Collection Logo"
        style="max-width: 200px; max-width: 60px" />
      <h1>
        <span style="color: #000000; font-size: 18px">STEWART COLLECTION</span>
      </h1>
    </header>
   
     <p>Click the link below and enter your OTP to verify your registeration</p>
      <div><a href="https://stewart-frontend-chile4coding.vercel.app/otp">click</a></div>
      <h2>${token}</h2>
        <footer style="text-align: center; margin-top: 20px">
      <p>Copyright &copy; ${new Date().getFullYear()} Stewart Collection</p>
    </footer>
  </body>

      `;

    const subject = "Stewart Collections OTP Registration";

    await sendEmail(content, user?.email as string, subject);
    await prisma.wallet.create({
      data: {
        amount: 0.0,
        user: { connect: { id: user.id } },
      },
    });

    res.status(StatusCodes.CREATED).json({
      message: "Registration successful",
    });
  } catch (error) {
    next(error);
  }
});

export const verifyOtp = expressAsyncHandler(async (req, res, next) => {
  const errors = validationResult(req.body);

  if (!errors.isEmpty()) {
    throwError("Invalid inputs", StatusCodes.BAD_REQUEST, true);
  }

  try {
    const { otp } = req.body;
    const otpExist = await prisma.user.findUnique({
      where: { otp_trial: otp },
    });

    console.log(otpExist?.otp_secret, otp);
    if (otpExist?.otp === otp) {
      throwError("OTP has been used ", StatusCodes.BAD_REQUEST, true);
    }

    const isvalid = await verifyTwoFactorAuth(
      otp,
      otpExist?.otp_secret as string
    );

    if (!isvalid) {
      throwError("Invalid Otp", StatusCodes.BAD_REQUEST, true);
    }

    const findUser = await prisma.user.update({
      where: { otp_trial: otp as string },
      data: {
        otp: otp,
        verify_otp: true,
      },
    });

    if (!findUser) {
      throwError("Invalid OTP supplied", StatusCodes.BAD_REQUEST, true);
    }

    res.status(StatusCodes.OK).json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    next(error);
  }
});
export const requestOtp = expressAsyncHandler(async (req, res, next) => {
  const errors = validationResult(req.body);

  if (!errors.isEmpty()) {
    throwError("Invalid inputs", StatusCodes.BAD_REQUEST, true);
  }

  try {
    const { email } = req.body;

    const findUser = await prisma.user.findUnique({ where: { email: email } });

    if (!findUser) {
      throwError("user not found", StatusCodes.BAD_REQUEST, true);
    }
    const { token, secret } = await reqTwoFactorAuth();

    const userOtpupdate = await prisma.user.update({
      where: { email: findUser?.email as string },
      data: {
        otp_secret: secret.base32 as string,
        otp_trial: token,
        verify_otp: false,
      },
    });

    if (!userOtpupdate) {
      throwError("user not found", StatusCodes.BAD_REQUEST, true);
    }

     const content = `<body style="font-family: sans-serif; padding: 0; max-width: 600px; margin: 0 auto">
    <header
      style="
        text-align: center;
        background-color:#d9d9d9;
        display: flex;
        align-items: center;
        margin: 0 auto;
        justify-content: center;
      ">
      <img
        src="http://res.cloudinary.com/dynkejvim/image/upload/v1700235033/stewart/puv5v0bxq3zrojoqy2hn.png"
        alt="Stewart Collection Logo"
        style="max-width: 200px; max-width: 60px" />
      <h1>
        <span style="color: #000000; font-size: 18px">STEWART COLLECTION</span>
      </h1>
    </header>
     <p>Click the link below and enter your OTP to verify your OTP</p> 
     <div><a href="https://stewart-frontend-chile4coding.vercel.app/otp?">click</a></div>
     <h2>${token}</h2>
       <footer style="text-align: center; margin-top: 20px">
      <p>Copyright &copy; ${new Date().getFullYear()} Stewart Collection</p>
    </footer>
  </body>

      `;

    
    const subject = "Stewart Collections OTP Request";

    await sendEmail(content, findUser?.email as string, subject);

    res.status(StatusCodes.OK).json({
      message: "OTP sent",
      token,
    });
  } catch (error) {
    next(error);
  }
});
export const resetPassword = expressAsyncHandler(async (req, res, next) => {
  const errors = validationResult(req.body);

  if (!errors.isEmpty()) {
    throwError("Invalid inputs", StatusCodes.BAD_REQUEST, true);
  }

  try {
    const { email, password } = req.body;

    const findUser = await prisma.user.findUnique({ where: { email: email } });

    if (!findUser) {
      throwError("user not found", StatusCodes.BAD_REQUEST, true);
    }

    if (!findUser?.verify_otp) {
      throwError("OTP not verified, verify OTP", StatusCodes.BAD_REQUEST, true);
    }

    const hashedPassword = await hashPassword(password);

    const reset = await prisma.user.update({
      where: { email: findUser?.email },
      data: {
        passwords: hashedPassword,
      },
    });

    if (reset) {
      res.status(StatusCodes.OK).json({
        message: "Password Changed",
      });
    }
  } catch (error) {
    next(error);
  }
});

export const loginUser = expressAsyncHandler(async (req, res, next) => {
  const errors = validationResult(req.body);

  if (!errors.isEmpty()) {
    throwError("Invalid inputs", StatusCodes.BAD_REQUEST, true);
  }

  try {
    const { password, email } = req.body;

    const findUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        wallet: true,
        orders: true,
        review: true,
        inbox: true,
        save_items: true,
      },
    });

    if (!findUser) {
      throwError("User not registered", StatusCodes.BAD_REQUEST, true);
    }

    await comparePassword(password, findUser?.passwords as string);
    const token = JWTToken(
      findUser?.email as string,
      findUser?.id as string,
      "user"
    );

    res.status(StatusCodes.OK).json({
      message: "Welcome to Stewart Collections",
      token: token,
      findUser,
    });
  } catch (error) {
    next(error);
  }
});
export const updateProfile = expressAsyncHandler(async (req, res, next) => {
  const errors = validationResult(req.body);

  if (!errors.isEmpty()) {
    throwError("Invalid inputs", StatusCodes.BAD_REQUEST, true);
  }

  try {
    const { email, name, phone, country, state, city, address } = req.body;

    const findUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!findUser) {
      throwError("User not registered", StatusCodes.BAD_REQUEST, true);
    }

    const updateUser = await prisma.user.update({
      where: { email: findUser?.email },
      data: {
        email,
        name,
        phone,
        country,
        state,
        address,
        city,
      },
    });
    if (!updateUser) {
      throwError("Server error", StatusCodes.BAD_REQUEST, true);
    }

    res.status(StatusCodes.OK).json({
      message: "Welcome to Stewart Collections",

      updateUser,
    });
  } catch (error) {
    next(error);
  }
});

export const fundWallet = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const errors = validationResult(req.body);

    if (!errors.isEmpty()) {
      throwError("Invalid Input", StatusCodes.BAD_REQUEST, true);
    }
    const authId = req.authId;
    try {
      const { status, amount } = req.body;
      if (status !== "SUCCESS") {
        throwError("error in payment", StatusCodes.BAD_REQUEST, true);
      }
      const walletAmount = await prisma.wallet.findUnique({
        where: {
          user_id: authId,
        },
      });
      const amountUpdate = Number(walletAmount?.amount) + Number(amount);
      const newWallet = await prisma.wallet.update({
        where: { id: walletAmount?.id },
        data: {
          amount: amountUpdate,
        },
      });
      res
        .status(StatusCodes.OK)
        .json({ message: "Wallet funded successfully", wallet: newWallet });
    } catch (error) {
      next(error);
    }
  }
);
export const getUser = expressAsyncHandler(
  async (req: Request | any, res, next) => {
    const errors = validationResult(req.body);

    if (!errors.isEmpty()) {
      throwError("Invalid Input", StatusCodes.BAD_REQUEST, true);
    }
    const authId = req.authId;
    try {
      const user = await prisma.user.findUnique({
        where: { id: authId },
        include: {
          wallet: true,
          orders: true,
          review: true,
          inbox: true,
          save_items: true,
        },
      });
      if (!user) {
        throwError("User not found", StatusCodes.BAD_REQUEST, true);
      }

      res.status(StatusCodes.OK).json({
        message: "user logged in successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  }
);



cron.schedule(" 1 * *  * * * ", async () => {
  console.log("hello this is nice");
});
