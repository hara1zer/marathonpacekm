"""Static, source-derived counterparts to the two interactive Lab investigations."""
from html import escape


def clock(seconds, hours=True):
    value = int(abs(seconds) + .5)
    if hours:
        return f"{value // 3600}:{value // 60 % 60:02}:{value % 60:02}"
    return f"{value // 60}:{value % 60:02}"


def table(caption, headings, rows, label):
    return (f'<div class="analysis-table" tabindex="0" role="region" aria-label="{escape(label)}">'
            f'<table><caption>{escape(caption)}</caption><thead><tr>' +
            ''.join(f'<th scope="col">{escape(str(value))}</th>' for value in headings) +
            '</tr></thead><tbody>' + ''.join('<tr>' + ''.join(
                f'<th scope="row">{escape(str(value))}</th>' if index == 0 else f'<td>{escape(str(value))}</td>'
                for index, value in enumerate(row)) + '</tr>' for row in rows) + '</tbody></table></div>')


def render_replay(data):
    rows = []
    for year in ['2025', '2026']:
        paces = data[year]['pace_seconds_per_km']
        first = sum(paces[:10]) / 10
        later = sum(paces[10:20]) / 10
        rows.append([year, f'{first // 60:.0f}:{first % 60:04.1f}/km',
                     f'{later // 60:.0f}:{later % 60:04.1f}/km',
                     f'{later - first:+.1f} sec/km', clock(sum(paces[:20]))])
    comparison = table('First 20 complete recorded laps: two within-race patterns',
                       ['Activity', 'Laps 1–10 average', 'Laps 11–20 average', 'Later minus earlier pace', '20-lap sum'], rows,
                       'Recorded first and later ten-lap comparison; scroll for all columns')
    return f'''<section class="lab-analysis" id="race-replay" data-race-replay data-source="/assets/original/half-marathon-2025-2026-data.json" aria-labelledby="race-replay-title">
<p class="analysis-kicker">Race Replay / 41 recorded full laps</p>
<h2 id="race-replay-title">Where did the pace change?</h2>
<p>The first-to-last five-kilometre blocks give a useful overview. This analysis uses every available full lap and adds a second check: compare the first ten recorded laps with the next ten <em>within each race</em>.</p>
{comparison}
<p><strong>The new comparison:</strong> the later ten-lap segment took 6:08 longer than the first in 2025. In 2026 it took 0:32 less. Those totals come from the displayed lap paces: 57:12 then 1:03:20 in 2025; 52:38 then 52:06 in 2026. The 21st full 2026 lap, at 4:51/km, sits outside this common 20-lap comparison and remains available in the replay.</p>
<p class="analysis-method">These are watch-defined segments, not official 10 km checkpoints or exact race halves. The 2025 GPS loss prevents matching course positions across years. Rounded partial-lap labels are excluded from sums; the displayed activity time is kept separate.</p>
<p class="analysis-status" data-analysis-status role="status">The comparison and complete recorded lap tables remain readable without the replay.</p>
<div data-analysis-controls hidden>
  <div class="analysis-inputs">
    <fieldset><legend>Recorded activity</legend>
      <label for="replay-year"><span>Race year</span></label><select id="replay-year"><option value="2025">2025 · 20 full laps</option><option value="2026">2026 · 21 full laps</option></select>
      <label for="replay-lap"><span>Recorded kilometre</span></label><select id="replay-lap"></select>
      <div class="analysis-lap-buttons"><button type="button" data-replay-previous>Previous lap</button><button type="button" data-replay-next>Next lap</button></div>
    </fieldset>
    <fieldset><legend>Separate even-pace scenario</legend><div class="analysis-pace">
      <label for="replay-minutes"><span>Minutes per km</span><input id="replay-minutes" type="number" min="1" max="59" step="1" value="5" inputmode="numeric" aria-describedby="replay-help replay-error"></label>
      <label for="replay-seconds"><span>Seconds</span><input id="replay-seconds" type="number" min="0" max="59" step="1" value="40" inputmode="numeric" aria-describedby="replay-help replay-error"></label>
    </div><p id="replay-help" class="analysis-method">Compare the same recorded distance with an even pace you choose. This does not recalculate an official finish.</p></fieldset>
  </div>
  <p class="analysis-error" id="replay-error" data-analysis-error role="status"></p>
  <p class="analysis-observed" data-replay-observed></p>
  <div class="analysis-chart" data-analysis-chart tabindex="0" role="region" aria-label="Recorded lap pace chart; scroll horizontally for all laps"></div>
  <p class="analysis-method">Dots: recorded lap paces. Dashed line: chosen hypothetical pace. The larger dot marks the selected recorded lap.</p>
  <div data-replay-results aria-live="polite" aria-atomic="true"></div>
</div>
<h3>What this changes in the interpretation</h3>
<p>The difference extends beyond one finishing sprint: the 2026 record held a similar average pace across two ten-lap segments, while the 2025 record slowed over the later segment. That is a more specific description of the finish I want to repeat. It does not identify whether fitness, pacing, course, conditions or fueling produced the change.</p>
<p>For my next comparison I would retain the original activity file and official checkpoint times, then describe recorded and official distance separately. I would also log the intended effort and what was actually consumed. Those records would answer questions these screenshots leave open.</p>
<p class="analysis-method">Reproduce this: sum rounded lap paces 1–10 and 11–20 separately, divide each by ten for pace, then subtract the segment totals. Replay sums stop at the selected full lap. <a href="/assets/original/half-marathon-2025-2026-data.json">Download all source laps (JSON)</a> · <a href="#full-splits">Read the complete lap tables</a> · <a href="#sources">Source and transcription notes</a>.</p>
</section>'''


def render_prediction(data):
    weeks = data['weekly_km']
    runs = data['runs']
    dates = data['week_start_2026']
    best = max(range(9), key=lambda start: sum(weeks[start:start + 4]))
    choices = [('All 12 complete weeks', 0, 12), ('Highest consecutive four weeks', best, 4),
               ('Final four complete weeks', 8, 4), ('Highest single week', weeks.index(max(weeks)), 1)]
    window_rows = []
    for label, start, count in choices:
        window_rows.append([label, f'{dates[start]}–{dates[start + count - 1]} 2026',
                            f'{sum(weeks[start:start + count]) / count:.1f}', f'{sum(runs[start:start + count]) / count:.1f}'])
    windows = table('The same build described four ways', ['Included weeks', 'Week starting', 'km/week', 'runs/week'],
                    window_rows, 'Recorded training-window descriptions; scroll for all columns')
    predictions = table('Worked scenario: a 1:50:57 half over exactly twice the course distance',
                        ['Chosen exponent', 'Calculated marathon', 'Margin below 4:00:00', 'Half time for exactly four hours'],
                        [[f'{exponent:.2f}', clock(6657 * 2 ** exponent), clock(14400 - 6657 * 2 ** exponent, False),
                          clock(14400 / 2 ** exponent)] for exponent in [1.06, 1.08, 1.10]],
                        'Worked half-to-marathon prediction assumptions; scroll for all columns')
    peak_excess = (max(weeks) / (sum(weeks) / len(weeks)) - 1) * 100
    options = ''.join(f'<option value="{index}">{escape(choice[0])}</option>' for index, choice in enumerate(choices))
    return f'''<div class="lab-analysis" id="prediction-lab" data-prediction-lab data-source="/assets/original/sydney-2026-chart-data.json" role="region" aria-labelledby="prediction-lab-title">
<p class="analysis-kicker">Prediction Lab / a model-input audit</p>
<h3 id="prediction-lab-title">How much confidence was hidden in one finishing time?</h3>
<p>A 1:50:57 half gave me a plausible sub-four target. Here I test two separate assumptions: how much slowing the formula allows over twice the distance, and which weeks I use to describe my preparation.</p>
{predictions}
<p><strong>The margin is sensitive:</strong> changing only the exponent from 1.06 to 1.10 moves the scenario from 3:51:19 to 3:57:50, leaving 2:10 beneath four hours instead of 8:41. At an exponent of approximately 1.1131, the same half time maps to exactly four hours. This is a mathematical boundary, not my measured endurance exponent.</p>
<h4>The training record that the formula never sees</h4>
{windows}
<p>The published rounded weeks total 728.9 km. Across all twelve, that is 60.7 km/week. The peak week of 83.9 km is {peak_excess:.1f}% higher than that whole-block average. Even the highest four-week window averages 73.3 km/week; the final four average 64.7. Choosing a flattering window changes the description substantially.</p>
<p><strong>The model blind spot:</strong> every one of those training descriptions produces the same time when the half result and exponent stay fixed. This calculation receives no training history. The week selection is an audit of the evidence beside the prediction, not a validated way to adjust it.</p>
<p class="analysis-status" data-analysis-status role="status">The worked predictions and training-window table remain readable without interactive controls.</p>
<div data-analysis-controls hidden>
  <div class="analysis-inputs">
    <fieldset><legend>Your half-marathon time</legend><div class="analysis-time">
      <label for="prediction-hours"><span>Hours</span><input id="prediction-hours" type="number" min="0" max="23" step="1" value="1" inputmode="numeric" aria-describedby="prediction-error"></label>
      <label for="prediction-minutes"><span>Minutes</span><input id="prediction-minutes" type="number" min="0" max="59" step="1" value="50" inputmode="numeric" aria-describedby="prediction-error"></label>
      <label for="prediction-seconds"><span>Seconds</span><input id="prediction-seconds" type="number" min="0" max="59" step="1" value="57" inputmode="numeric" aria-describedby="prediction-error"></label>
    </div></fieldset>
    <fieldset><legend>Assumptions to inspect</legend>
      <label for="prediction-exponent"><span>Distance exponent (1.00–1.30)</span><input id="prediction-exponent" type="number" min="1" max="1.3" step="any" value="1.06" inputmode="decimal" aria-describedby="prediction-model-help prediction-error"></label>
      <label for="prediction-window"><span>Describe the recorded Sydney build using</span></label><select id="prediction-window">{options}</select>
    </fieldset>
  </div>
  <p class="analysis-error" id="prediction-error" data-analysis-error role="status"></p>
  <div data-prediction-results aria-live="polite" aria-atomic="true"></div>
</div>
<h4>How I would use this before another race</h4>
<p>I would record the half result, selected exponent and target before the marathon, then retain the whole build—including interrupted weeks—beside that prediction. After the race I would compare the chosen scenario with an official elapsed result and describe pacing, course and actual intake separately. This record does not contain an exact official Sydney finish time, so it cannot supply a numerical prediction error or calibrate a better exponent.</p>
<p class="analysis-method" id="prediction-model-help"><strong>Reproduce the arithmetic:</strong> marathon seconds = half seconds × 2<sup>exponent</sup>; required half seconds = 14,400 ÷ 2<sup>exponent</sup>. The example treats a half as 21.0975 km and a marathon as 42.195 km; it does not treat a watch GPS distance as course distance. Outputs round once to whole seconds. The standalone predictor rounds to 30 seconds, so its displayed time can differ slightly. Exponents are illustrative assumptions, not a confidence interval. Weekly averages use the published rounded distances, with no outcome or readiness score attached.</p>
<p class="analysis-method"><a href="/assets/original/sydney-2026-chart-data.json">Download the published training and selected-lap data (JSON)</a> · <a href="#training">Inspect all 12 training weeks</a> · <a href="/methodology/#prediction">Prediction method</a> · <a href="#sources">Original source notes</a>.</p>
</div>'''
