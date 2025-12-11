from datetime import datetime, timezone

def _defer():
    global MATCHER, ARCHIVE_NAME
    
    # The template to use for the archive name.
    # The following kwargs are available in the format string:
    # iso_t: the current (UTC) date and time
    ARCHIVE_NAME = "backups/{iso_t}.zip"
    
    # Used to select which files to include in the backup
    # By default, include everything except the backups folder!
    MATCHER = -(MatchStem("backups") | MatchStem("__pycache__"))

from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import re
import os

class Match:
    def matches(self, path): return False

    def __neg__(self): return MatchNot(self)
    def __and__(self, other): return MatchAnd(self, other)
    def __or__(self, other): return MatchOr(self, other)

class MatchExtension(Match):
    def __init__(self, ext): self.ext = ext
    def matches(self, path): return path.suffix == self.ext

class MatchStemRegex(Match):
    def __init__(self, expr): self.expr = re.compile(expr)
    def matches(self, path): return self.expr.fullmatch(path.stem) is not None

class MatchStem(Match):
    def __init__(self, stem): self.stem = stem
    def matches(self, path):
        return self.stem == path.stem

class MatchNot(Match):
    def __init__(self, match): self.match = match
    def matches(self, path): return not self.match.matches(path)

class MatchAnd(Match):
    def __init__(self, a, b):
        self.a = a
        self.b = b

    def matches(self, path): return self.a.matches(path) and self.b.matches(path)

class MatchOr(Match):
    def __init__(self, a, b):
        self.a = a
        self.b = b

    def matches(self, path): return self.a.matches(path) or self.b.matches(path)

class MatchExactlyIn(Match):
    def __init__(self, prefix): self.prefix = Path(prefix)
    def matches(self, path): return path.parent == self.prefix

_defer()

def main(root = Path(__file__).parent, out=ARCHIVE_NAME, m=MATCHER, compression=ZIP_DEFLATED, on_add=None, comment=None):
    """
    Zip up the source code into a single archive.

    Arguments
        root: the root folder for the source code. Defaults to whichever folder holds this python
            script.
        out: The archive name format string to produce. The default is ARCHIVE_NAME, set in the _defer() function
            above.
        m: The Match object that describes which files to include. The default is MATCHER, set in
            the _defer() function above.
        compression: They type of file compression to apply to the zip archive. The default is
            ZIP_DEFLATED.
        comment: A bytes object containing the zip file comment, or none for no comment.
    """
    
    out=out.format(
        iso_t=datetime.now(timezone.utc).strftime("%Y-%m-%d-%H-%M-%S")
    )
    
    queue = [("/",root)]
    directories = []
    files = []
    while queue:
        base, r = queue.pop()
        for f in os.scandir(r):
            path = base + f.name

            if m.matches(Path(path)):
                if f.is_dir():
                    directories.append(path)
                    queue.append((path + "/", f.path))
                else:
                    files.append(path)


    with ZipFile(out, "w", compression) as arch:
        if comment is not None:
            arch.comment = comment
        for d in directories:
            arch.mkdir(d[1:])
            pass
        if on_add is None:
            for f in files:
                arch.write(f"{root}{f}", arcname=f[1:])
        else:
            for f in files:
                name = f[1:]
                on_add(out, name)
                arch.write(f"{root}{f}", arcname=name)


if __name__ == "__main__":
    main()
