/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useMemo } from 'react';
import { Row, Icon, Text, Chip } from '@zextras/carbonio-design-system';
import { includes, map, reduce } from 'lodash';
import styled from 'styled-components';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useTags, ZIMBRA_STANDARD_COLORS, runSearch } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { EventType } from '../../types/event';
import { CALENDAR_ROUTE } from '../../constants';

const TagChip = styled(Chip)`
	margin-left: ${({ theme }): string => theme.sizes.padding.extrasmall};
	padding: 1px 8px !important;
	margin-bottom: 4px;
`;

const TagsRow: FC<{ event: EventType; hideIcon: boolean }> = ({
	event,
	hideIcon = false
}): ReactElement => {
	const [t] = useTranslation();
	const tagsFromStore = useTags();
	const tags = useMemo(
		() =>
			reduce(
				tagsFromStore,
				(acc: any, v: any) => {
					if (includes(event?.resource?.tags, v.id))
						acc.push({
							...v,
							color: ZIMBRA_STANDARD_COLORS[v.color ?? 0].hex,
							label: v.name
						});
					return acc;
				},
				[]
			),
		[event?.resource?.tags, tagsFromStore]
	);
	const tagLabel = useMemo(() => t('label.tags', 'Tags'), [t]);

	const triggerSearch = useCallback(
		(tagToSearch) =>
			runSearch(
				[
					{
						avatarBackground: tagToSearch?.color,
						avatarIcon: 'Tag',
						background: 'gray2',
						hasAvatar: true,
						isGeneric: false,
						isQueryFilter: true,
						label: `tag:${tagToSearch?.name}`,
						value: `tag:"${tagToSearch?.name}"`
					}
				],
				CALENDAR_ROUTE
			),
		[]
	);
	return (
		<>
			<Row
				width="fill"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				padding={{ vertical: 'small' }}
			>
				{!hideIcon && (
					<Row padding={{ right: 'small' }}>
						<Icon icon="TagsMoreOutline" size="medium" />
					</Row>
				)}

				{event?.resource?.tags?.length > 0 && (
					<Row takeAvailableSpace mainAlignment="flex-start">
						{!hideIcon ? (
							<Text color="secondary" size="small" overflow="break-word">
								{map(tags, (tag) => (
									<TagChip
										key={tag.name}
										label={tag.name}
										avatarBackground={tag.color}
										background="gray2"
										hasAvatar
										avatarIcon="Tag"
										maxWidth="300px"
										onClick={(): void => triggerSearch(tag)}
									/>
								))}
							</Text>
						) : (
							<Text color="secondary" size="small" overflow="break-word">
								{tagLabel}:
								{map(tags, (tag) => (
									<TagChip
										label={tag.name}
										avatarBackground={tag.color}
										background="gray2"
										hasAvatar
										avatarIcon="Tag"
										maxWidth="300px"
										onClick={(): void => triggerSearch(tag)}
									/>
								))}
							</Text>
						)}
					</Row>
				)}
			</Row>
		</>
	);
};

export default TagsRow;
