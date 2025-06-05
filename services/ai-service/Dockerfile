FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY preload.py .
RUN python preload.py
COPY app.py .
EXPOSE 5000
CMD ["uvicorn","app:app","--host","0.0.0.0","--port","5000"]