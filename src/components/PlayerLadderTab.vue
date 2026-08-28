<template>
  <div>
    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      border="start"
      border-color="red"
      class="mb-4"
      closable
      @click:close="errorMessage = null"
    >
      {{ errorMessage }}
    </v-alert>

    <v-row align="center" class="my-2">
      <v-spacer />
      <v-col cols="12" sm="4" md="3">
        <v-select
          v-model="scope"
          :items="scopeOptions"
          item-title="name"
          item-value="id"
          label="Season"
          variant="outlined"
          density="compact"
          hide-details
          @update:modelValue="reload"
        />
      </v-col>
    </v-row>

    <!-- Stat tiles -->
    <v-row class="mb-2">
      <v-col v-if="scoped" cols="12" sm="3">
        <v-card variant="outlined">
          <v-card-title class="bg-primary text-body-2 d-flex align-center py-1">
            <v-icon size="small" class="mr-2">mdi-trophy</v-icon>Points
          </v-card-title>
          <v-card-text class="text-center">
            <div class="text-h5">{{ data?.points ?? 0 }}</div>
            <div class="text-caption text-medium-emphasis">{{ ladderPointsLine }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="3">
        <v-card variant="outlined">
          <v-card-title class="bg-primary text-body-2 d-flex align-center py-1">
            <v-icon size="small" class="mr-2">mdi-trending-up</v-icon>Wins
          </v-card-title>
          <v-card-text class="text-center">
            <div class="text-h5 text-green">{{ data?.wins ?? 0 }}</div>
            <div class="text-caption text-medium-emphasis">{{ winrate }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="3">
        <v-card variant="outlined">
          <v-card-title class="bg-primary text-body-2 d-flex align-center py-1">
            <v-icon size="small" class="mr-2">mdi-trending-down</v-icon>Losses
          </v-card-title>
          <v-card-text class="text-center">
            <div class="text-h5 text-red">{{ data?.losses ?? 0 }}</div>
            <div class="text-caption text-medium-emphasis">{{ data?.games ?? 0 }} games</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="3">
        <v-card variant="outlined">
          <v-card-title class="bg-primary text-body-2 d-flex align-center py-1">
            <v-icon size="small" class="mr-2">mdi-star</v-icon>{{ mmrHeader }}
          </v-card-title>
          <v-card-text class="text-center">
            <div class="text-h5">{{ data?.mmr?.current ?? '—' }}</div>
            <div class="text-caption text-medium-emphasis">{{ mmrRange }}</div>
            <a v-if="player?.battleTag" :href="w3cStatsUrl" target="_blank" class="text-caption">W3Champions</a>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Cumulative ladder points, the player against his team average -->
    <v-card v-if="chart" variant="outlined" class="mb-4">
      <v-card-title class="text-body-2 d-flex align-center">
        <span>Ladder points</span>
        <v-spacer />
        <span class="d-inline-flex align-center text-caption mr-4">
          <span class="legend-swatch legend-player mr-2"></span>Player
        </span>
        <span class="d-inline-flex align-center text-caption">
          <span class="legend-swatch legend-team mr-2"></span>Team average
        </span>
      </v-card-title>
      <v-card-text class="pt-0">
        <svg :viewBox="`0 0 ${chart.w} ${chart.h}`" class="ladder-chart">
          <line :x1="chart.padL" :y1="chart.topY" :x2="chart.right" :y2="chart.topY" stroke="#EEEEEE" stroke-width="1" />
          <line :x1="chart.padL" :y1="chart.baseY" :x2="chart.right" :y2="chart.baseY" stroke="#EEEEEE" stroke-width="1" />
          <text :x="chart.padL - 4" :y="chart.topY + 4" text-anchor="end" font-size="11" fill="rgba(0,0,0,0.6)">{{ chart.total }}</text>
          <text :x="chart.padL - 4" :y="chart.baseY + 4" text-anchor="end" font-size="11" fill="rgba(0,0,0,0.6)">0</text>
          <polyline fill="none" stroke="rgba(24,103,192,0.30)" stroke-width="2" :points="chart.avgPoly" />
          <polyline fill="none" stroke="#1867C0" stroke-width="2" :points="chart.poly" />
          <circle :cx="chart.dotX" :cy="chart.avgDotY" r="3.5" fill="rgba(24,103,192,0.30)" />
          <circle :cx="chart.dotX" :cy="chart.dotY" r="3.5" fill="#1867C0" />
          <template v-for="tick in chart.ticks" :key="tick.label">
            <line :x1="tick.x" :y1="chart.baseY" :x2="tick.x" :y2="chart.baseY + 4" stroke="rgba(0,0,0,0.24)" stroke-width="1" />
            <text :x="tick.x" :y="chart.h - 4" text-anchor="middle" font-size="11" fill="rgba(0,0,0,0.6)">{{ tick.label }}</text>
          </template>
        </svg>
      </v-card-text>
    </v-card>

    <!-- Versus race -->
    <v-card variant="outlined" class="mb-4">
      <v-card-title class="text-body-2">Versus race</v-card-title>
      <v-card-text class="pt-0">
        <div v-for="row in versusRaces" :key="row.code" class="d-flex align-center text-body-2 my-2" style="gap: 10px">
          <RaceIcon :raceIdentifier="row.code" />
          <span class="text-no-wrap" style="width: 96px">{{ row.name }}</span>
          <v-progress-linear
            :model-value="row.rate"
            color="success"
            bg-color="error"
            :bg-opacity="1"
            height="12"
            rounded
            class="flex-grow-1"
          />
          <span class="text-right text-no-wrap" style="width: 76px">{{ row.w }} - {{ row.l }}</span>
          <span class="text-right" style="width: 50px">{{ row.rate }}%</span>
          <span class="text-right text-medium-emphasis" style="width: 50px">{{ row.total }}</span>
        </div>
      </v-card-text>
    </v-card>

    <!-- Achievements: what the season paid out, then the rules still open -->
    <v-card v-if="scoped" variant="outlined" class="mb-4">
      <v-card-title class="text-body-2 d-flex align-center">
        <span>Achievements</span>
        <v-spacer />
        <span class="text-caption text-medium-emphasis">{{ achievedPoints }} pts</span>
      </v-card-title>
      <v-card-text class="pt-0">
        <div v-for="badge in earned" :key="badge.id" class="d-flex align-center badge-row">
          <v-icon size="small" color="amber-darken-2" class="mr-3">{{ badge.icon }}</v-icon>
          <span class="text-body-2 font-weight-medium mr-3">{{ badge.name }}</span>
          <span class="text-caption text-medium-emphasis">{{ badge.description }}</span>
          <v-spacer />
          <span class="text-body-2 text-amber-darken-2 ml-3">+{{ badge.points }}</span>
        </div>
        <div class="text-caption text-medium-emphasis mt-4 mb-1">Locked</div>
        <div v-for="badge in locked" :key="badge.id" class="d-flex align-center badge-row text-medium-emphasis">
          <v-icon size="small" class="mr-3">{{ badge.icon }}</v-icon>
          <span class="text-body-2 mr-3">{{ badge.name }}</span>
          <span class="text-caption">{{ badge.description }}</span>
          <v-spacer />
          <span class="text-body-2 ml-3">+{{ badge.points }}</span>
        </div>
      </v-card-text>
    </v-card>

    <!-- Matches, one page of the route at a time -->
    <v-card variant="outlined">
      <v-card-title class="text-body-2 d-flex align-center">
        <span>Matches</span>
        <v-spacer />
        <span class="text-caption text-medium-emphasis">{{ data?.games ?? 0 }}</span>
      </v-card-title>
      <v-data-table-server
        :headers="matchHeaders"
        :items="data?.matches ?? []"
        :items-length="data?.games ?? 0"
        :items-per-page="itemsPerPage"
        v-model:page="page"
        :loading="isLoading"
        density="compact"
        @update:options="loadPage"
      >
        <template v-slot:[`item.start_time`]="{ item }">{{ matchDate(item.start_time) }}</template>
        <template v-slot:[`item.map_name`]="{ item }">{{ item.map_name || '—' }}</template>
        <template v-slot:[`item.opp_battletag`]="{ item }">
          <div class="d-flex align-center" style="gap: 6px">
            <RaceIcon v-if="item.opp_race" :raceIdentifier="item.opp_race" />
            <span
              v-if="item.opp_user_id"
              class="opponent-link"
              @click.stop="emit('open-player', item.opp_user_id)"
            >{{ item.opp_battletag }}</span>
            <span v-else>{{ item.opp_battletag }}</span>
            <v-chip v-if="teamOf(item.opp_user_id)" size="x-small">{{ teamOf(item.opp_user_id) }}</v-chip>
          </div>
        </template>
        <template v-slot:[`item.won`]="{ item }">
          <span :class="item.won ? 'text-green' : 'text-red'">{{ item.won ? 'W' : 'L' }}</span>
        </template>
        <template v-slot:[`item.duration_s`]="{ item }">{{ duration(item.duration_s) }}</template>
        <template v-slot:[`item.mmr_diff`]="{ item }">
          <span :class="mmrDiff(item) > 0 ? 'text-green' : mmrDiff(item) < 0 ? 'text-red' : ''">
            {{ mmrDiff(item) > 0 ? `+${mmrDiff(item)}` : mmrDiff(item) }}
          </span>
        </template>
      </v-data-table-server>
    </v-card>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { DateTime } from 'luxon';
import { useLadderStore, useSeasonStore } from '@/stores';
import RaceIcon from '@/components/RaceIcon.vue';
import { achievementPoints } from '@/helpers/achievements';

const props = defineProps({
  player: { type: Object, default: null },
  seasonId: { type: Number, default: null },
  w3cSeason: { type: Number, default: null },
});

const emit = defineEmits(['open-player']);

const ladderStore = useLadderStore();
const seasonStore = useSeasonStore();

const scope = ref(props.seasonId ?? 'all');
const data = ref(null);
const seasonLadder = ref(null);
const isLoading = ref(false);
const errorMessage = ref(null);
const itemsPerPage = ref(10);
const page = ref(1);

const scoped = computed(() => scope.value !== 'all');

const scopeOptions = computed(() => [
  ...(seasonStore.seasons || []).map(season => ({ id: season.id, name: season.name })),
  { id: 'all', name: 'All time' },
]);

const matchHeaders = [
  { title: 'Date (UTC)', key: 'start_time', sortable: false },
  { title: 'Map', key: 'map_name', sortable: false },
  { title: 'Opponent', key: 'opp_battletag', sortable: false },
  { title: 'Result', key: 'won', sortable: false },
  { title: 'Duration', key: 'duration_s', sortable: false },
  { title: 'MMR +/-', key: 'mmr_diff', sortable: false },
];

const mmrHeader = computed(() => (props.w3cSeason ? `MMR (S${props.w3cSeason})` : 'MMR'));

const w3cStatsUrl = computed(
  () => `https://www.w3champions.com/player/${encodeURIComponent(props.player?.battleTag ?? '')}/statistics`
);

const winrate = computed(() => {
  const games = data.value?.games ?? 0;
  return games ? `${Math.round((data.value.wins / games) * 100)}%` : '0%';
});

const mmrRange = computed(() => {
  const mmr = data.value?.mmr;
  return mmr?.min != null && mmr?.max != null ? `${mmr.min} - ${mmr.max}` : '';
});

// The tile total also carries achievement points, so the ladder half is named when it differs
const ladderPointsLine = computed(() => {
  const ladder = (data.value?.wins ?? 0) * 3 + (data.value?.losses ?? 0);
  return ladder === (data.value?.points ?? 0) ? 'ladder points' : `${ladder} ladder points`;
});

// The earned rules come with the player, the whole catalogue with the season
const earned = computed(() => data.value?.achievements ?? []);
const achievedPoints = computed(() => achievementPoints(earned.value));
const locked = computed(() => {
  const won = new Set(earned.value.map(badge => badge.id));
  return (seasonLadder.value?.achievement_rules ?? []).filter(rule => !won.has(rule.id));
});

const versusRaces = computed(() => {
  const names = { HU: 'Human', OC: 'Orc', NE: 'Night Elf', UD: 'Undead', RANDOM: 'Random' };
  const vs = data.value?.vs_race ?? {};
  return Object.keys(names).map(code => {
    const [w, l] = vs[code] ?? [0, 0];
    const total = w + l;
    return { code, name: names[code], w, l, total, rate: total ? Math.round((w / total) * 100) : 0 };
  });
});

// The team of the season a GNL opponent plays for, for the chip next to his name
const teamOf = (userId) => {
  if (!userId) return null;
  const team = (seasonLadder.value?.teams ?? []).find(t => t.players.some(p => p.id === userId));
  return team?.name ?? null;
};

const teammates = computed(() =>
  (seasonLadder.value?.teams ?? []).find(t => t.players.some(p => p.id === props.player?.id))?.players ?? []
);

// Cumulative ladder points per season day, the player against the mean of his team
const chart = computed(() => {
  if (!scoped.value || !data.value || !seasonLadder.value) return null;
  const axis = chartAxis();
  if (axis.length < 2) return null;

  const runTotal = (perDay) => {
    const byDate = new Map((perDay ?? []).map(day => [day.d, day]));
    let sum = 0;
    return axis.map(date => {
      const day = byDate.get(date);
      if (day) sum += day.w * 3 + day.l;
      return sum;
    });
  };

  const mine = runTotal(data.value.per_day);
  const mateRuns = teammates.value.map(mate => runTotal(mate.per_day));
  const teamAvg = axis.map((_, i) =>
    mateRuns.length ? mateRuns.reduce((sum, run) => sum + run[i], 0) / mateRuns.length : 0
  );

  const w = 900, h = 150, padL = 46, padR = 10, padT = 12, padB = 22;
  const total = mine[mine.length - 1];
  const avgEnd = teamAvg[teamAvg.length - 1];
  const top = Math.max(1, total, avgEnd);
  const px = (i) => padL + (i * (w - padL - padR)) / (axis.length - 1);
  const py = (v) => padT + ((top - v) / top) * (h - padT - padB);
  const line = (values) => values.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');

  const ticks = [];
  for (let i = 0; i * 7 < axis.length; i++) {
    ticks.push({ x: px(i * 7).toFixed(1), label: `Week ${i + 1}` });
  }

  return {
    w, h, padL, right: w - padR, baseY: h - padB, total: Math.round(total),
    poly: line(mine), avgPoly: line(teamAvg),
    dotX: px(axis.length - 1).toFixed(1), dotY: py(total).toFixed(1), avgDotY: py(avgEnd).toFixed(1),
    topY: py(total).toFixed(1), ticks,
  };
});

// Every day of the season up to the last one anyone on the team played, so the two lines share an axis
function chartAxis() {
  const season = seasonLadder.value?.season;
  if (!season?.start_date) return [];
  const played = teammates.value
    .flatMap(mate => (mate.per_day ?? []).map(day => day.d))
    .concat((data.value?.per_day ?? []).map(day => day.d));
  if (!played.length) return [];
  const last = played.reduce((a, b) => (a > b ? a : b));
  const end = season.end_date && season.end_date < last ? season.end_date : last;

  const days = [];
  let at = DateTime.fromISO(season.start_date, { zone: 'utc' });
  const stop = DateTime.fromISO(end, { zone: 'utc' });
  while (at <= stop && days.length < 400) {
    days.push(at.toISODate());
    at = at.plus({ days: 1 });
  }
  return days;
}

const matchDate = (iso) => DateTime.fromISO(iso, { zone: 'utc' }).toFormat('yyyy-LL-dd HH:mm');
const duration = (seconds) => {
  const total = seconds ?? 0;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};
const mmrDiff = (match) => (match.mmr_after ?? 0) - (match.mmr_before ?? 0);

const loadPage = async ({ page, itemsPerPage: perPage }) => {
  if (!props.player?.id) return;
  itemsPerPage.value = perPage;
  isLoading.value = true;
  errorMessage.value = null;
  try {
    data.value = await ladderStore.userLadder(props.player.id, {
      seasonId: scoped.value ? scope.value : null,
      limit: perPage,
      offset: (page - 1) * perPage,
    });
    seasonLadder.value = scoped.value
      ? ladderStore.ladders[scope.value] ?? (await ladderStore.seasonLadder(scope.value))
      : null;
  } catch (error) {
    data.value = null;
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
};

const reload = () => {
  page.value = 1;
  return loadPage({ page: 1, itemsPerPage: itemsPerPage.value });
};

// A new player, or a new season, reopens the tab on its first page
watch(() => [props.player?.id, props.seasonId], () => {
  scope.value = props.seasonId ?? 'all';
  reload();
});
</script>

<style scoped>
.badge-row {
  padding: 4px 0;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.ladder-chart {
  display: block;
  width: 100%;
  max-width: 900px;
  height: auto;
}
.legend-swatch {
  width: 16px;
  height: 3px;
  display: inline-block;
}
.legend-player {
  background: #1867C0;
}
.legend-team {
  background: rgba(24, 103, 192, 0.3);
}
.opponent-link {
  cursor: pointer;
  text-decoration: underline;
  color: rgb(var(--v-theme-primary));
}
</style>
