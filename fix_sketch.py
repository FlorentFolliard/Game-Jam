#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('c:/Users/oscar/Desktop/Game-Jam/src/sketch.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remplacer showCoords(); par showCoords(); + le nouveau code  
old_text = '''  drawWalls();
  showCoords();
}

function drawTimeBox'''

new_text = '''  drawWalls();
  showCoords();
  
  let currentLevelTime = frameCount - levelStartTime;
  let totalTimeFrame = totalGameTime + currentLevelTime;
  drawTimeBox("Salle: " + formatTime(currentLevelTime), 20);
  drawTimeBox("Total: " + formatTime(totalTimeFrame), 55);
}

function drawTimeBox'''

if old_text in content:
    content = content.replace(old_text, new_text)
    with open('c:/Users/oscar/Desktop/Game-Jam/src/sketch.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print('✓ Modifications appliquées avec succès!')
else:
    print('✗ Le texte à remplacer n\'a pas été trouvé')
    print('Recherche de "drawWalls"...')
    if 'drawWalls();' in content:
        print('✓ "drawWalls();" trouvé')
    if 'showCoords();' in content:
        print('✓ "showCoords();" trouvé')
