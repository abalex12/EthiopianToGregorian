from flask import Flask, render_template, request, jsonify, url_for
from converter import EthiopianDateConverter
import os

app = Flask(__name__)

# Configure static folder and templates
app.static_folder = 'static'
app.template_folder = 'templates'

# Add cache busting for static files
@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

def dated_url_for(endpoint, **values):
    if endpoint == 'static':
        filename = values.get('filename', None)
        if filename:
            file_path = os.path.join(app.root_path,
                                   endpoint, filename)
            values['q'] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)

from datetime import datetime

from datetime import datetime

@app.route('/')
def index():
    return render_template('index.html', year=datetime.now().year)
@app.route('/home')
def home():
    return render_template('index.html', year=datetime.now().year)

@app.route('/calendar')
def calendar():
    return render_template('calendar.html', year=datetime.now().year)

@app.route('/holiday')
def holiday():
    return render_template('holiday.html', year=datetime.now().year)
@app.route('/language')
def language():
    return render_template('language.html', year=datetime.now().year)
@app.route('/help')
def help():
    return render_template('help.html',year=datetime.now().year)

@app.route('/about')
def about():
    return render_template('about.html', year=datetime.now().year)


@app.route("/convert", methods=["GET"])
def convert():
    try:
        conversion_type = request.args.get("conversionType")
        
        if conversion_type == "gregorianToEthiopian":
            gregorian_date = request.args.get("gregorianDate")
            year, month, day = map(int, gregorian_date.split("-"))
            ethiopian_date = EthiopianDateConverter.to_ethiopian(year, month, day)
            
            return jsonify({
                "success": True,
                "result": {
                    "year": ethiopian_date[0],
                    "month": ethiopian_date[1],
                    "day": ethiopian_date[2]
                }
            })

        elif conversion_type == "ethiopianToGregorian":
            ethiopian_year = int(request.args.get("ethiopianYear"))
            ethiopian_month = int(request.args.get("ethiopianMonth"))
            ethiopian_day = int(request.args.get("ethiopianDay"))
            
            gregorian_date = EthiopianDateConverter.to_gregorian(
                ethiopian_year, ethiopian_month, ethiopian_day)
            
            return jsonify({
                "success": True,
                "result": {
                    "year": gregorian_date.year,
                    "month": gregorian_date.month,
                    "day": gregorian_date.day
                }
            })
        
        else:
            return jsonify({
                "success": False,
                "error": "Invalid conversion type"
            }), 400

    except ValueError as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "An unexpected error occurred"
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)