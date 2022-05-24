/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useState, useCallback, useEffect, useMemo } from 'react';
import { Container } from '@zextras/carbonio-design-system';
import { isEmpty, map, reduce } from 'lodash';
import moment from 'moment';

import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { FOLDERS, useUserSettings } from '@zextras/carbonio-shell-ui';
import { searchAppointments } from '../../store/actions/search-appointments';
import { getSelectedEvents } from '../../store/selectors/appointments';
import { selectCalendars } from '../../store/selectors/calendars';
import { Store } from '../../types/store/store';
import SearchList from './search-list';
import SearchPanel from './search-panel';

type SearchProps = {
	useQuery: () => [Array<any>, (arg: any) => void];
	ResultsHeader: FC<{ label: string }>;
	useDisableSearch: () => [boolean, (arg: any) => void];
};

export type SearchResults = {
	appointments: Record<string, string[]>;
	more: boolean;
	offset: number;
	sortBy: string;
	query: Array<{ label: string }>;
};

const SearchView: FC<SearchProps> = ({ useDisableSearch, useQuery, ResultsHeader }) => {
	const [query, updateQuery] = useQuery();
	const [t] = useTranslation();
	const [searchResults, setSearchResults] = useState<SearchResults>({
		appointments: {},
		more: false,
		offset: 0,
		sortBy: 'none',
		query: []
	});
	const [loading, setLoading] = useState(false);
	const dispatch = useDispatch();
	const { path } = useRouteMatch();
	const settings = useUserSettings()?.prefs;
	const [resultLabel, setResultLabel] = useState<string>(t('label.results_for', 'Results for: '));
	const [isInvalidQuery, setIsInvalidQuery] = useState<boolean>(false);
	const [includeTrash, includeSharedFolders] = useMemo(
		() => [
			settings?.zimbraPrefIncludeTrashInSearch === 'TRUE',
			settings?.zimbraPrefIncludeSharedItemsInSearch === 'TRUE'
		],
		[settings]
	);

	const calendars = useSelector(selectCalendars);
	const searchInFolders = useMemo(
		() =>
			reduce(
				calendars,
				(acc: Array<string>, v: any, k: string) => {
					if (v.id === FOLDERS.TRASH && includeTrash && v.checked) {
						acc.push(k);
					}
					if (v.isShared && includeSharedFolders && v.checked) {
						acc.push(k);
					}
					if (v.id !== FOLDERS.TRASH && !v.isShared && v.checked) acc.push(k);
					return acc;
				},
				[]
			),
		[calendars, includeSharedFolders, includeTrash]
	);

	const foldersToSearchInQuery = useMemo(
		() => `( ${map(searchInFolders, (folder) => `inid:"${folder}"`).join(' OR ')})`,
		[searchInFolders]
	);

	const search = useCallback(
		(queryStr: Array<{ label: string; value?: string }>, reset: boolean) => {
			setResultLabel(t('label.loading_results', 'Loading Results...'));
			setLoading(true);
			const spanStart = moment().startOf('day').valueOf();
			const spanEnd = moment().startOf('day').add(1209600000, 'milliseconds').valueOf();

			const queryMap = `${queryStr
				.map((c) => c.value ?? c.label)
				.join(' ')} ${foldersToSearchInQuery}`;
			dispatch(
				searchAppointments({
					spanStart,
					spanEnd,
					query: queryMap,
					offset: reset ? 0 : searchResults.offset,
					sortBy: searchResults.sortBy
				})
			) // eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				.then(({ payload }: any) => {
					setLoading(true);
					const ids = reduce(
						payload.appt,
						(acc, v) => ({ ...acc, [v.id]: map(v.inst, 'ridZ') }),
						{}
					);
					setSearchResults({
						query: queryStr,
						appointments: ids,
						more: payload.more,
						offset: (payload.offset ?? 0) + 100,
						sortBy: payload.sortBy ?? 'none'
					});
					setLoading(false);
				})

				.catch(() => {
					setLoading(false);
					const tempDestructuring = [...queryStr];
					const newQueryStr = map(tempDestructuring, (qs) => ({
						...qs,
						disabled: true,
						isQueryFilter: true
					}));
					updateQuery(newQueryStr);
					setIsInvalidQuery(true);

					setResultLabel(
						t('label.results_for_error', 'Unable to start the search, clear it and retry: ')
					);
				});
		},
		[t, foldersToSearchInQuery, dispatch, searchResults.offset, searchResults.sortBy, updateQuery]
	);

	const loadMore = useCallback(() => {
		if (!loading && searchResults && !isEmpty(searchResults.appointments) && searchResults.more) {
			search(query, false);
		}
	}, [loading, query, search, searchResults]);

	useEffect(() => {
		if (query && query.length > 0 && query !== searchResults.query && !isInvalidQuery) {
			search(query, true);
		}
		if (query && query.length === 0) {
			setIsInvalidQuery(false);
			setResultLabel(t('label.results_for', 'Results for: '));
		}
	}, [query, search, searchResults.query, isInvalidQuery, t]);

	const appointments = useSelector((state: Store) =>
		getSelectedEvents(state, searchResults.appointments ?? [], calendars)
	);
	return (
		<Container style={{ whiteSpace: 'nowrap' }}>
			<ResultsHeader label={resultLabel} />
			<Container orientation="horizontal" style={{ minHeight: '0px' }} mainAlignment="flex-start">
				<Switch>
					<Route path={`${path}/:action?/:apptId?/:ridZ?`}>
						<SearchList loadMore={loadMore} appointments={appointments} loading={loading} />
						<Container background="gray5" width="75%" mainAlignment="center">
							<SearchPanel appointments={appointments} />
						</Container>
					</Route>
				</Switch>
			</Container>
		</Container>
	);
};

export default SearchView;
