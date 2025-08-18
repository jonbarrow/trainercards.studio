import { ref, watch } from 'vue';
import type { Ref } from 'vue';

export function useDebounce<T>(source: Ref<T>, delay: number = 500): Ref<T> {
	const debounced = ref(source.value) as Ref<T>;

	let timer: ReturnType<typeof setTimeout> | null = null;
	watch(source, (newValue: T) => {
		if (timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			debounced.value = newValue;
		}, delay);
	});

	return debounced;
}
