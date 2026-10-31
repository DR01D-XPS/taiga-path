window.VN_SCENARIO = {
  "title": "Таежный путь",
  "maxScore": 30,
  "instantText": true,
  "start": "intro",
  "nodes": {
    "intro": {
      "steps": [
        {
          "type": "bg",
          "id": "scene1"
        },
        {
          "type": "char",
          "id": null
        },
        {
          "type": "say",
          "text": "Ваш путь начинается у берегов реки Уссури, там вы встречаете своего первого проводника."
        },
        {
          "type": "bg",
          "id": "scene4"
        },
        {
          "type": "char",
          "id": "yanseli3"
        },
        {
          "type": "say",
          "text": "К вам подходит ваш знакомый — Сулунгу."
        }
      ],
      "next": "fire_intro"
    },
    "fire_intro": {
      "steps": [
        {
          "type": "char",
          "id": "yanseli8"
        },
        {
          "type": "say",
          "speaker": "Сулунгу",
          "text": "Огонь — старый человек. Он всегда голоден. Если не угостишь его, он не согреет твою душу, а лишь обожжет руки. У тебя есть что-то для Подя?"
        },
        {
          "type": "choice",
          "question": "Что предложить огню?",
          "options": [
            {
              "text": "Бросить в огонь юколы",
              "next": "fire_1",
              "score": 10
            },
            {
              "text": "Бросить в огонь рыбью кость",
              "next": "fire_2",
              "score": 0
            },
            {
              "text": "«Расскажи мне о нем, Сулунгу»",
              "next": "fire_3",
              "score": 5
            }
          ]
        }
      ]
    },
    "fire_1": {
      "steps": [
        {
          "type": "bg",
          "id": "scene9_10"
        },
        {
          "type": "char",
          "id": "yanseli6"
        },
        {
          "type": "say",
          "text": "Пламя вспыхивает ярко-синим. Сулунгу улыбается."
        }
      ],
      "next": "scene2_intro"
    },
    "fire_2": {
      "steps": [
        {
          "type": "char",
          "id": "yanseli10"
        },
        {
          "type": "say",
          "speaker": "Сулунгу",
          "text": "Подя — не собака! Кинуть ему кость — значит пожелать себе пустой охоты."
        }
      ],
      "next": "scene2_intro"
    },
    "fire_3": {
      "steps": [
        {
          "type": "char",
          "id": "yanseli3"
        },
        {
          "type": "say",
          "text": "Сулунгу рассказывает легенду о Фадзя-Мама, которая живет в каждой спичке и в каждом очаге."
        }
      ],
      "next": "scene2_intro"
    },
    "scene2_intro": {
      "steps": [
        {
          "type": "bg",
          "id": "s2_intro"
        },
        {
          "type": "char",
          "id": "s2_yanseli_intro"
        },
        {
          "type": "say",
          "speaker": "Сулунгу",
          "text": "Тэму — Хозяин Воды. Он может дать рыбу, а может перевернуть лодку. Попроси его за нас"
        },
        {
          "type": "choice",
          "question": "Что вы скажете духу воды?",
          "options": [
            {
              "text": "Бросить сугди (подношение) и просить удачи",
              "next": "scene2_water_luck",
              "score": 5
            },
            {
              "text": "Бросить сугди и просить знаний",
              "next": "scene2_water_knowledge",
              "score": 10
            },
            {
              "text": "Бросить сугди и ничего не просить у реки",
              "next": "scene2_water_silent",
              "score": 0
            }
          ]
        }
      ]
    },
    "scene2_water_luck": {
      "steps": [
        {
          "type": "char",
          "id": "s2_yanseli_neutral"
        },
        {
          "type": "say",
          "text": "Сулунгу спокоен. Путь будет гладким."
        }
      ],
      "next": "scene5_intro"
    },
    "scene2_water_knowledge": {
      "steps": [
        {
          "type": "char",
          "id": "s2_yanseli_kind"
        },
        {
          "type": "say",
          "text": "Сулунгу кажется довольным. Река кажется более прозрачной, а путь уверенным."
        }
      ],
      "next": "scene5_intro"
    },
    "scene2_water_silent": {
      "steps": [
        {
          "type": "char",
          "id": "s2_yanseli_angry"
        },
        {
          "type": "say",
          "speaker": "Сулунгу",
          "text": "Тэму не любит пустых рук, но еще больше не любит пустых мыслей."
        }
      ],
      "next": "scene5_intro"
    },
    "scene5_intro": {
      "steps": [
        {
          "type": "bg",
          "id": "s5_intro"
        },
        {
          "type": "char",
          "id": "s5_elder_neutral"
        },
        {
          "type": "say",
          "speaker": "Старший рода",
          "text": "«Смотри на меня, охотник. Вижу, рука тянется к ружью... Не торопись. Тайга — не поле для стрельбы, это дом для тех, кто там родился. Теперь подумай и скажи, как готовиться ты будешь?»"
        },
        {
          "type": "choice",
          "question": "Как подготовиться к походу?",
          "options": [
            {
              "text": "Тщательно подготовить оружие.",
              "next": "scene5_choice_weapon",
              "score": 0
            },
            {
              "text": "Сделать упор на припасы для долгого пути.",
              "next": "scene5_choice_supplies",
              "score": 0
            },
            {
              "text": "Совершить подаяние духу у кумирни.",
              "next": "scene5_choice_offering",
              "score": 10
            }
          ]
        }
      ]
    },
    "scene5_choice_weapon": {
      "steps": [
        {
          "type": "char",
          "id": "s5_elder_displeased"
        },
        {
          "type": "say",
          "speaker": "Старший рода",
          "text": "«Тайга даёт каждому на пропитание, если он относится к ней с уважением. Без подаяния духам ты не сможешь договориться с лесом и навлечёшь на себя неудачу»."
        }
      ],
      "next": "finale"
    },
    "scene5_choice_supplies": {
      "steps": [
        {
          "type": "char",
          "id": "s5_elder_displeased"
        },
        {
          "type": "say",
          "speaker": "Старший рода",
          "text": "«Тайга даёт каждому на пропитание, если он относится к ней с уважением. Без подаяния духам ты не сможешь договориться с лесом и навлечёшь на себя неудачу»."
        }
      ],
      "next": "finale"
    },
    "scene5_choice_offering": {
      "steps": [
        {
          "type": "char",
          "id": "s5_elder_pleased"
        },
        {
          "type": "say",
          "speaker": "Старший рода",
          "text": "«Сила и расчёт важны, но тайга принимает только тех, кто сначала проявляет уважение к её духам»."
        }
      ],
      "next": "finale"
    },
    "finale": {
      "steps": [
        {
          "type": "bg",
          "id": "s6_final"
        },
        {
          "type": "char",
          "id": null
        },
        {
          "type": "say",
          "text": "Ваше путешествие сделало вас новым человеком. Познакомившись с богатыми культурами Приморья, вы осознали многообразие мировоззрений. Ваши спутники открыли вам другую сторону той земли, с историей которой неразрывно связана ваша жизнь."
        },
        {
          "type": "endcard",
          "kicker": "Ваш итог",
          "title": "{scoreTitle}",
          "body": "Вы набрали {score} из 30 баллов. Насколько вы понимаете дух коренного Приморья: {scoreResult}",
          "links": [
            {
              "label": "ВК Молодежь Приморья",
              "href": "https://vk.ru/molprim",
              "buttonAsset": "optimized/ui/endcard-button-nanai.webp"
            },
            {
              "label": "ВК Сейчас Объясню",
              "href": "https://vk.ru/seichasobyasnu",
              "buttonAsset": "optimized/ui/endcard-button-orochi.webp"
            },
            {
              "label": "Новый проект Сейчас Объясню",
              "href": "https://vk.com/chebylo",
              "buttonAsset": "optimized/ui/endcard-button-tazy.webp"
            }
          ]
        }
      ]
    }
  }
};
