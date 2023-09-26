# Kobo Whiteboard

This is a basic canvas drawing website that allows you to draw using the built-in beta web browser on a Kobo E-reader and live-share it to another computer. This is primarily useful for using your Kobo as a whiteboard in a Teams/Zoom meeting (by sharing your screen).

![demo screenshot](https://github-production-user-asset-6210df.s3.amazonaws.com/608054/270659184-beb80052-29be-4162-bf65-c512a8edb3ff.jpg)

## Usage

There is an instance of it hosted at [kobo.kaiser.lol](https://kobo.kaiser.lol/). You can use that instance or host your own.

To use it, visit the website on your kobo, this will automatically redirect you into a "room" with a unique URL. You can then open that same URL on your computer and draw on the same canvas. You can also share the URL with others to allow them to draw on the same canvas.

## Limitations

There are a bunch of limitations currently, that anyone is more than welcome to help out by submitting a pull request.

- Sometimes when drawing, the webpage will decide to zoom which messes things up. The best resolution in this case currently is to reload the page as state is stored.
- Using the rotate function on desktop is useful for viewing a landscape-created drawing on an Elipsa 2E, but drawing from the rotated computer is completely broken due to the CSS used to perform the rotation.
- Full screen mode has no way to bring back the toolbar, you just have to reload.
