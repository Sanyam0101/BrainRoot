import bcrypt
hash_str = b"$2b$12$nN7WthoSbRprODRcaPCMrO3SkcfOOyu5fQEsPtsbn8baXmnOMiqkC"
print(bcrypt.checkpw(b"test", hash_str))
