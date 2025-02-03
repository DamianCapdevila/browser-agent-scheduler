from langchain_openai import ChatOpenAI
from flask import Flask, request, jsonify
from browser_use import Agent
from dotenv import load_dotenv
from system_prompt import MySystemPrompt
import os
load_dotenv()

import asyncio

open_ai_llm = ChatOpenAI(model="gpt-4o-mini")
usuario_fotocasa=os.getenv("USUARIO_FOTOCASA")
contraseña_fotocasa=os.getenv("CONTRASEÑA_FOTOCASA")

task_fotocasa = f"""1 - Ve a https://fotocasa.com y accede al sitio con usuario {usuario_fotocasa} , contraseña {contraseña_fotocasa}
               2 - Ve a la página de inicio. 
               3 - Hay 2 "Alquilar",  haz click en el que está más bajo en la página, a la derecha de "Comprar", a la izquierda de "Obra Nueva".
               3 - En la misma página, hay una barra de busqueda donde puedes escribir. Busca Madrid Capital, Madrid.
               4 - Click en el filtro de precio. Es un drop down con scrolling.
               5 - Filtra según precio máximo de 1000 Euros. 
               6 - Debes darle a "Mostrar xxx anuncios" para continuar una vez seleccionado el filtro.
               7 - Ponte en contacto con el anunciante del piso más barato, escribiéndole un mensaje corto que demuestre que tienes interés.
               8 - Cierra sesión."""

                    

task_matrimonio = f""" Ve a https://gestiona.madrid.org/CTAC_CITA/registro y solicita una cita en el registro civil unico de madrid, en la sección matrimonios. 
                       No eres un robot.
                    """

async def main():
    agent = Agent(
        task= task_matrimonio,
        llm=open_ai_llm,
        system_prompt_class=MySystemPrompt
    )
    result = await agent.run()
    print(result)

asyncio.run(main())
