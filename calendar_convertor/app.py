from flask import Flask, send_from_directory, redirect, url_for

app = Flask(__name__, static_folder="static", template_folder=".")

# Serve main index.html at root
@app.route("/")
def index():
    return send_from_directory(".", "index.html")

# Serve other static pages (about.html, faq.html, etc.)
@app.route("/<page>")
def html_page(page):
    allowed_pages = [
        "index.html",
        "robots.txt",
        "sitemap.xml",
    ]
    if page in allowed_pages:
        return send_from_directory(".", page)
    return "404 Not Found", 404

# Serve static assets (css, js, images, etc.)
@app.route("/static/<path:path>")
def static_files(path):
    return send_from_directory("static", path)

@app.route("/convert")
def redirect_convert():
    return redirect(url_for("html_page", page="index.html"), code=301)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
