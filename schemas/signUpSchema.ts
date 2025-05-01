import * as z from 'zod';

export const signUpSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }).min(1, { message: 'Email is required' }),
    password: z.string().min(1, { message: 'Password is Requried' }).min(8, { message: 'Password must be at least 8 characters long' }),
    passwordConfirmation: z.string().min(1, { message: 'Please confirm you password' }).min(8, { message: 'Password Confirmation must be at least 8 characters long' }),
}) 
// this is used to check if the password and password confirmation are the same
.refine((d)=> d.password===d.passwordConfirmation,{
    
    message: "Password does not match",
    path: ["passwordConfirmation"], // this is the path to the field that will be marked as invalid aka the password confirmation field will be marked as invalid when the password and password confirmation do not match
})