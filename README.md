# ytb-slicer

## SETUP (currently manual)

install npm dependencies

```bash
npm install
```

install ffmpeg (better with homebrew)

```bash
brew install ffmpeg
```

copy `videos.template.json` to `videos.json` and fill in the videos you want to slice

should look like this

```json
{
	"videos": []
}
```

### Usage

Use either `ytbslicer` or `ytbslicer-multi` (currently working on multi videos) in live.
