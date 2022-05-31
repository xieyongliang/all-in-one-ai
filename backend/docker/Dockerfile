FROM ubuntu:20.04

RUN mkdir -p /opt/program

ENV LANG=en_US.utf8
ENV PYTHONUNBUFFERED=TRUE
ENV PYTHONDONTWRITEBYTECODE=TRUE
ENV PATH="/opt/program:${PATH}"

RUN apt-get update
RUN apt-get install -y software-properties-common
RUN add-apt-repository ppa:deadsnakes/ppa
# Install py39 from deadsnakes repository
RUN apt-get install -y python3.9
# Install pip from standard ubunt
RUN apt-get install -y python3-pip
RUN pip3 install boto3
RUN pip3 install sagemaker

COPY *.py /opt/program/

WORKDIR /opt/program

CMD ["python", "task.py"]
ENTRYPOINT ["python", "task.py"]
