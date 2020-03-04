def label = "jenkins-slave-${UUID.randomUUID().toString()}"
def project = 'kubesail'

podTemplate(label: label, yaml: """
apiVersion: v1
kind: Pod
metadata:
  namespace: jenkins-kubesail
labels:
  component: ci
spec:
  nodeSelector:
    kubernetes.io/hostname: ip-10-0-1-126
  containers:
  - name: builder
    image: kubesail/jenkins-slave:v12
    imagePullPolicy: IfNotPresent
    command:
    - cat
    tty: true
    env:
    - name: GET_HOSTS_FROM
      value: dns
    - name: DOCKER_HOST
      value: tcp://jenkins-dind:2375
    resources:
      requests:
        cpu: 2
        memory: 4000Mi
      limits:
        cpu: 7
        memory: 12000Mi
"""
  ) {
  node(label) {
    properties([disableConcurrentBuilds()])
    checkout scm
    container('builder') {
      ansiColor('linux') {
        timeout(30) {
          sh "docker build -t kubesail/agent:${env.BRANCH_NAME} ."
        }
      }
    }
  }
}