import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

// Hashes the password
export const hashPassword = async(password) =>{
    return bcrypt.hash(password, SALT_ROUNDS);
}

// gets the plain text from the response and compares with the database hash of the password
export const comparePassword = async(plainText, hash)=>{
    return bcrypt.compare(plainText, hash);
}