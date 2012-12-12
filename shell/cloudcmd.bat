:: -------------------------------------
:: Changing charset back to 866, because
:: all win32 default commands, that work
:: thru cmd.exe showing out in unicode
:: charset. So Cloud Commander changes
:: 866 charset to Unicode 65001 sometime
:: when it's neaded.
:: -------------------------------------
node ../cloudcmd || chcp 866