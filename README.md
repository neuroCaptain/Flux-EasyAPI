# Flux-EasyAPI

EasyAPI for Flux in ComfyUI. 
## Requirements
- python 3.11
## How to deploy
*create .env file with huggingface api token to be able to download dev model*  
1. clone repo
```
git clone https://github.com/neuroCaptain/Flux-EasyAPI.git
```
2. create venv with python 3.11
```
python3.11 -m venv venv
```
3. activate venv
```
source venv/bin/activate
```
4. install requirements
```
pip install -r requirements.txt
```
5. install comfyui with script `-m {1,3}` to skip choosing of models.
 ```bash
# List of models to download: 1 - FP16. 2 - FP8. 3 - FluxDev. 4 - FluxSchnell.
python setup.py -m {1,3}
```
