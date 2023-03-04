import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useForm } from "react-hook-form";
import { FieldValues } from "react-hook-form/dist/types";
import { useState } from "react";
import axios from "../../axios";
import { useNavigate } from "react-router-dom";
import { Auth } from "../Auth";

export const Signup = () => <Auth label="Sign Up" url="/signup" />;
