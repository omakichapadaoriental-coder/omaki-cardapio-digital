import json
import os
import sys

# Load current data
with open('cardapio-digital-omaki/data/cardapio.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Update phone and PIX key with the extra 9
data['store']['whatsapp'] = '5562991749928'
data['store']['whatsappFormatted'] = '+55 (62) 99174-9928'
data['store']['pixKey'] = '+55 62 99174-9928'
data['store']['pixKeyRaw'] = '+55 62 99174-9928'

items = data['items']

# Update photos for page 10 combos to the newly cropped high-res photos
for it in items:
    num = it.get('num')
    if num == 177:
        it['photo'] = 'assets/images/combo_177_omaki_40pc.jpg'
    elif num == 178:
        it['photo'] = 'assets/images/combo_178_chapada_40pc.jpg'
    elif num == 179:
        it['photo'] = 'assets/images/combo_179_oriental_36pc.jpg'
    elif num == 180:
        it['photo'] = 'assets/images/combo_180_guia_30pc.jpg'
    elif num == 6:
        it['photo'] = 'assets/images/cat_joy_goiaba.jpg'

item_map = {it['num']: it for it in items if it.get('num') is not None}

dishes = []

def make_grouped_dish(id, title, category, portion, photo, desc, option_nums, page):
    opts = []
    prices = []
    for n in option_nums:
        if n in item_map:
            it = item_map[n]
            opts.append({
                'num': it['num'],
                'code': it['code'],
                'name': it['name'],
                'fullName': it['fullName'],
                'description': it['description'],
                'price': it['price'],
                'portion': it['portion']
            })
            prices.append(it['price'])
    min_price = min(prices) if prices else 0.0
    max_price = max(prices) if prices else 0.0
    price_label = f"R$ {min_price:,.2f}".replace('.', ',') if min_price == max_price else f"A partir de R$ {min_price:,.2f}".replace('.', ',')
    return {
        'id': id,
        'isGrouped': True,
        'title': title,
        'name': title,
        'category': category,
        'portion': portion,
        'photo': photo,
        'image': photo,
        'description': desc,
        'price': min_price,
        'priceLabel': price_label,
        'page': page,
        'options': opts
    }

def make_single_dish(item):
    p_label = f"R$ {item['price']:,.2f}".replace('.', ',')
    return {
        'id': f"item_{item.get('num') or item.get('code') or item['name'].lower().replace(' ', '_')}",
        'isGrouped': False,
        'num': item.get('num'),
        'code': item.get('code'),
        'title': item['name'],
        'name': item['name'],
        'category': item['category'],
        'portion': item.get('portion'),
        'photo': item.get('photo'),
        'image': item.get('photo'),
        'description': item.get('description'),
        'price': item['price'],
        'priceLabel': p_label,
        'page': item.get('page'),
        'isNew': item.get('isNew', False),
        'rawItem': item
    }

# 1. Harumakis (1-4)
dishes.append(make_grouped_dish('harumaki_group', 'Harumakis Crocantes', 'Harumakis', '2 un', 'assets/images/harumaki.jpg', 'Rolinho primavera crocante frito na hora. Escolha o recheio.', [1, 2, 3, 4], 'Pág 1'))

# 2. Entradas
dishes.append(make_single_dish(item_map[5])) # Guioza
dishes.append(make_single_dish(item_map[6])) # Joy de Goiaba (now with cat_joy_goiaba.jpg)

# 3. Tatakis (7-11)
dishes.append(make_grouped_dish('tataki_group', 'Tatakis Especiais', 'Tatakis', '200g', 'assets/images/tataki.jpg', 'Salmão fresco com raspas de limão, azeite, shoyu e temperos do Chef. Escolha o sabor.', [7, 8, 9, 10, 11], 'Pág 1'))

# 4. Ceviches (12-15)
dishes.append(make_grouped_dish('ceviche_group', 'Ceviches Tradicionais', 'Ceviches', '200g', 'assets/images/ceviche.jpg', 'Cubos marinados em molho cítrico especial da casa e cebola roxa. Escolha a sua combinação.', [12, 13, 14, 15], 'Pág 1'))

# 5. Camarão Imperial (16-17)
dishes.append(make_grouped_dish('camarao_imperial_group', 'Camarão Imperial Crocante', 'Camarão Imperial', '6 un', 'assets/images/camarao_imperial.jpg', 'Camarões empanados super crocantes com molho especial. Escolha a finalização.', [16, 17], 'Pág 1'))

# 6. Carpaccios (18-20)
dishes.append(make_grouped_dish('carpaccio_group', 'Carpaccios Nobres', 'Carpaccios', '12 fatias', 'assets/images/carpaccio.jpg', 'Finas fatias com azeite, flor de sal, limão e especiarias. Escolha o corte.', [18, 19, 20], 'Pág 2'))

# 7. Oishi (21-22)
dishes.append(make_grouped_dish('oishi_group', 'Oishi Especial', 'Oishi', '230g', 'assets/images/oishi.jpg', 'Especialidade da casa com peixes nobres e molhos especiais. Escolha a combinação.', [21, 22], 'Pág 2'))

# 8. Kobachi (23-25) -> Grouped!
dishes.append(make_grouped_dish('kobachi_group', 'Kobachi — Entradas Japonesas', 'Entradas', 'Porção', 'assets/images/shimeji_manteiga.png', 'Porções tradicionais japonesas: Shimeji na manteiga, Missoshiru artesanal ou Sunomono refrescante.', [23, 24, 25], 'Pág 2'))

# 9. Gunkans (26-29)
dishes.append(make_grouped_dish('gunkan_group', 'Gunkans', 'Gunkans', '6 un', 'assets/images/gunkan.jpg', 'Todos levam tártare de salmão, arroz e cream cheese Philadelphia. Escolha o acabamento.', [26, 27, 28, 29], 'Pág 2'))

# 10. Veganos e Vegetarianos (30-36)
dishes.append(make_grouped_dish('vegano_group', 'Futomaki Vegano e Vegetariano', 'Veganos e Vegetarianos', '10 un', 'assets/images/futomaki_vegano.jpg', 'Opções leves e frescas com ou sem Philadelphia. Escolha o sabor.', [30, 31, 32, 33, 34, 35, 36], 'Pág 2'))

# 11. Sashimis especiais (37-40)
dishes.append(make_grouped_dish('sashimi_especial_group', 'Sashimis Especiais', 'Especiais do Chef', '10 fatias', 'assets/images/esp_40_tesouro_chef.jpg', 'Lâminas nobres de salmão com molhos autorais do sushiman.', [37, 38, 39, 40], 'Pág 3'))

# 12. Uramakis Especiais (41-47): individual dishes with unique photos!
for n in range(41, 48):
    dishes.append(make_single_dish(item_map[n]))

# 13. Temakis Tradicionais & Especiais (48-56)
dishes.append(make_grouped_dish('temaki_group', 'Temakis Tradicionais & Especiais', 'Temakis', '180g', 'assets/images/esp_50_supremo_salmao.png', 'Todos levam cream cheese Philadelphia e alga crocante. Escolha o recheio.', [48, 49, 50, 51, 52, 53, 54, 55, 56], 'Pág 4'))

# 14. Combos do Chef (57, 58, 59, 60): individual cards with individual photos!
for n in [57, 58, 59, 60]:
    dishes.append(make_single_dish(item_map[n]))

# 15. Big Hot (61-63)
dishes.append(make_grouped_dish('bighot_group', 'Big Hot', 'Big Hot', '2 un', 'assets/images/bighot.jpg', 'Hot rolls gigantes empanados e fritos, finalizados com tarê e cebolinha.', [61, 62, 63], 'Pág 5'))

# 16. Hot Rolls (64-69)
dishes.append(make_grouped_dish('hotrolls_group', 'Hot Rolls', 'Hot Rolls', '10 un', 'assets/images/hotroll.jpg', 'Rolls empanados e crocantes com cream cheese Philadelphia. Escolha o recheio e finalização.', [64, 65, 66, 67, 68, 69], 'Pág 6'))

# 17. Sashimis Tradicionais (70-72)
dishes.append(make_grouped_dish('sashimi_trad_group', 'Sashimis Tradicionais', 'Sashimis Tradicionais', '5 un', 'assets/images/sashimi_tradicional.jpg', 'Fatias frescas de salmão e tilápia fresca com flor de sal e limão.', [70, 71, 72], 'Pág 6'))

# 18. Joys Tradicionais (73-78)
dishes.append(make_grouped_dish('joy_trad_group', 'Joys Tradicionais (Sem Arroz)', 'Joys Tradicionais', '6 un', 'assets/images/joy_tradicional.jpg', 'Fatias nobres de salmão maçaricado ou fresco enrolados com Philadelphia.', [73, 74, 75, 76, 77, 78], 'Pág 6'))

# 19. Joy Ebi Fry (79-83)
dishes.append(make_grouped_dish('joy_ebifry_group', 'Joy Ebi Fry', 'Joy Ebi Fry', '6 un', 'assets/images/joy_ebifry.jpg', 'Contém salmão, camarão empanado crocante e Philadelphia. Escolha o topping.', [79, 80, 81, 82, 83], 'Pág 6'))

# 20. Hossomakis (84-88)
dishes.append(make_grouped_dish('hossomaki_group', 'Hossomakis', 'Hossomakis', '10 un', 'assets/images/hossomaki.jpg', 'Uramakis finos com alga nori por fora. Escolha o recheio.', [84, 85, 86, 87, 88], 'Pág 7'))

# 21. Uramakis Tradicionais (89-94)
dishes.append(make_grouped_dish('uramaki_trad_group', 'Uramakis Tradicionais', 'Uramakis', '10 un', 'assets/images/uramaki_tradicional.jpg', 'Arroz temperado por fora e gergelim. Todos vêm com cream cheese Philadelphia.', [89, 90, 91, 92, 93, 94], 'Pág 7'))

# 22. Uramakis Joy Especial (95-96)
dishes.append(make_grouped_dish('uramaki_joy_group', 'Uramakis Joy Especiais', 'Uramakis', '10 un', 'assets/images/uramaki_joy.jpg', 'Envoltos em salmão fresco maçaricado, geleia de pimenta e furikake.', [95, 96], 'Pág 7'))

# 23. Niguiris (97-104)
dishes.append(make_grouped_dish('niguiri_group', 'Niguiris', 'Niguiris', '4 un', 'assets/images/niguiri.jpg', 'Bolinho de arroz japonês coberto com lâmina de peixe selecionado.', [97, 98, 99, 100, 101, 102, 103, 104], 'Pág 7'))

# 24. Monte seu Poke 300g (105-110)
poke_dish = make_grouped_dish('poke_group', 'Monte seu Poke (300g)', 'Pokes', '300g', 'assets/images/poke.jpg', '80g de proteína nobre + escolha até 6 acompanhamentos + escolha 1 molho.', [105, 106, 107, 108, 109, 110], 'Pág 8')
poke_dish['isPoke'] = True
poke_dish['pokeToppings'] = [it['name'] for it in items if it['category'] == 'Acompanhamentos Poke']
poke_dish['pokeSauces'] = [it['name'] for it in items if it['category'] == 'Molhos Poke']
dishes.append(poke_dish)

# 25. Molhos & Adicionais Extras (131-136) -> Grouped!
dishes.append(make_grouped_dish('molhos_group', 'Molhos & Adicionais Extras', 'Adicionais e Molhos', 'Porção extra', 'assets/images/molhos_adicionais.jpg', 'Porções extras de molho teriaky artesanal, alho-poró crocante, geleias e acompanhamentos.', list(range(131, 137)), 'Pág 8'))

# 26. Teppan Yaki (137-139)
dishes.append(make_grouped_dish('teppan_group', 'Teppan Yaki (400g)', 'Teppan Yaki', '400g', 'assets/images/teppan.jpg', '200g de proteína nobre grelhada com legumes refogados na chapa e arroz gohan.', [137, 138, 139], 'Pág 8'))

# 27. Yakisobas (140-144)
dishes.append(make_grouped_dish('yakisoba_group', 'Yakisoba Tradicional (400g)', 'Yakisobas', '400g', 'assets/images/yakisoba.jpg', 'Macarrão artesanal, legumes selecionados refogados e molho especial do Chef.', [140, 141, 142, 143, 144], 'Pág 8'))

# 28. Sucos (145-152)
dishes.append(make_grouped_dish('sucos_group', 'Sucos Naturais & Polpa de Fruta (330ml)', 'Bebidas e Sucos', '330ml', 'assets/images/sucos.jpg', 'Refrescantes e preparados na hora. Escolha o sabor.', list(range(145, 153)), 'Pág 9'))

# 29. Sakês & Doses (153-159) -> Grouped!
dishes.append(make_grouped_dish('sake_group', 'Sakês Japoneses & Nacionais', 'Sakês e Doses', 'Doses & Garrafas', 'assets/images/bebidas_sake.png', 'Doses e garrafas de sakê importado Hakutsuru e nacional Azuma Kirin Dourado.', list(range(153, 160)), 'Pág 9'))

# 30. Refrigerantes, Águas & Energético (160-168) -> Grouped!
dishes.append(make_grouped_dish('refrigerantes_group', 'Refrigerantes, Águas & Energético', 'Refrigerantes e Águas', 'Lata / Garrafa', 'assets/images/refrigerantes.jpg', 'Refrigerantes em lata, água mineral com ou sem gás, H2O e Energético Red Bull gelados.', list(range(160, 169)), 'Pág 9'))

# 31. Cervejas Especiais (169-176) -> Grouped!
dishes.append(make_grouped_dish('cervejas_group', 'Cervejas Long Neck & 600ml', 'Cervejas', 'Long Neck & 600ml', 'assets/images/cervejas.jpg', 'Heineken, Corona, Stella Artois, Spaten e Antarctica Original trincando de geladas.', list(range(169, 177)), 'Pág 9'))

# 32. Combos Promocionais Clássicos (177-180)
for n in [177, 178, 179, 180]:
    dishes.append(make_single_dish(item_map[n]))

# 33. Novos Combos Promocionais (7 novos combos)
for it in items:
    if it.get('isNew'):
        dishes.append(make_single_dish(it))

print(f'Total dishes created: {len(dishes)}')

data['dishes'] = dishes

# Save updated JSON and JS
with open('cardapio-digital-omaki/data/cardapio.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

with open('cardapio-digital-omaki/data/cardapio.js', 'w', encoding='utf-8') as f:
    f.write('window.OMAKI_DATA = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n')

print('cardapio.json and cardapio.js updated successfully!')
