import argparse
import time

import requests
import urllib.parse


def main():
    args = parse_args()

    if args.command == "login":
        login(args.email, args.password, challenge_number=args.challenge_number)
    elif args.command == "register":
        register(args.firstname, args.lastname, args.username, args.email, args.password, challenge_number=args.challenge_number)


def parse_args():
    parser = argparse.ArgumentParser(description='Speedrunning tool for hanio.de')
    subparsers = parser.add_subparsers(title="commands",
                                       dest="command",
                                       help="Use an existing account (login) or create a new one (register)")

    login_parser = subparsers.add_parser(name="login",
                                         description="Use an existing account on hanio.de and complete all challenges")
    login_parser.add_argument("-e", "--email",
                              dest="email",
                              help="The email from the account you want to login as",
                              type=str,
                              required=True)
    login_parser.add_argument("-p", "--password",
                              dest="password",
                              help="The password from the account you want to login as",
                              type=str,
                              required=True)
    login_parser.add_argument("-c", "--challenge_number",
                              dest="challenge_number",
                              help="The number of the challenge you want to complete",
                              type=int,
                              default=None)

    register_parser = subparsers.add_parser(name="register",
                                            description="Create a new account on hanio.de and complete all challenges")
    register_parser.add_argument("-f", "--first-name",
                                 dest="firstname",
                                 help="Your first name",
                                 type=str,
                                 required=True)
    register_parser.add_argument("-l", "--last-name",
                                 dest="lastname",
                                 help="Your last name",
                                 type=str,
                                 required=True)
    register_parser.add_argument("-u", "--username",
                                 dest="username",
                                 help="Your username (has to match this regex: [A-z\-]{8,})",
                                 type=str,
                                 required=True)
    register_parser.add_argument("-e", "--email",
                                 dest="email",
                                 help="The email from the account you want to register",
                                 type=str,
                                 required=True)
    register_parser.add_argument("-p", "--password",
                                 dest="password",
                                 help="The password from the account you want to register",
                                 type=str,
                                 required=True)
    register_parser.add_argument("-c", "--challenge_number",
                                 dest="challenge_number",
                                 help="The number of the challenge you want to complete (all if none is specified)",
                                 type=int,
                                 default=None)

    return parser.parse_args()


def solve_all_challenges(cookie):
    for i in range(1, 61):
        print(f"\r{i}", end="")
        solve_challenge(i, cookie)


def solve_challenge(challenge_number, cookie):
    for level in range(4):
        params = {
            "p": challenge_number,
            "num": 5,
            "check": 5,
            "lev": level,
            "con": 1,
            "work": 1
        }
        headers = {
            "Host": "hanio.de",
            "Cookie": cookie,
        }
        requests.get(url="https://hanio.de/mains/page_success_notificator.php",
                     params=params,
                     headers=headers)
        time.sleep(1)


def login(email, password, **kwargs):
    data = urllib.parse.urlencode({
        "nutzername": email,
        "nutzerlosung": password,
        "losgehts": "Ich wünsche einzutreten."
    })
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
    }
    res = requests.post(url="https://hanio.de/mains/login.php",
                        headers=headers,
                        data=data,
                        allow_redirects=False)

    if res.cookies:
        if "SejongToken" in res.cookies.get_dict():
            cookie = f"SejongToken={res.cookies.get_dict()['SejongToken']}"

            if "challenge_number" in kwargs and kwargs["challenge_number"] is not None:
                solve_challenge(kwargs["challenge_number"], cookie)
            else:
                solve_all_challenges(cookie)
    else:
        # login fail
        print("login fail")
        pass


def register(firstname, lastname, username, email, password, **kwargs):
    data = urllib.parse.urlencode({
        "vornamewert": firstname,
        "nachnamewert": lastname,
        "emailwert1": email,
        "emailwert2": email,
        "nutzerwert": username,
        "passwert1": password,
        "passwert2": password
    })
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    res = requests.post(url="https://hanio.de/mains/register.php",
                        data=data,
                        headers=headers,
                        allow_redirects=False)

    if res.cookies:
        if "SejongToken" in res.cookies.get_dict():
            cookie = f"SejongToken={res.cookies.get_dict()['SejongToken']}"

            if "challenge_number" in kwargs:
                solve_challenge(kwargs["challenge_number"], cookie)
            else:
                solve_all_challenges(cookie)
    else:
        # register fail
        print("register fail")
        pass


if __name__ == "__main__":
    main()

